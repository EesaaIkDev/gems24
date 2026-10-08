import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { ArrowLeft, User } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import MessageBubble from "@/components/chat/MessageBubble";
import MessageComposer from "@/components/chat/MessageComposer";
import useKeyboardInset from "@/components/chat/useKeyboardInset";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import useChatPresence from "@/hooks/useChatPresence";
import {
  isActive,
  loadMessagePage,
  markRead,
  otherIdOf,
  otherReadAt,
  sendMessage,
  upsertMessages,
} from "@/lib/chat";
import { HEARTBEAT_MS } from "@/lib/presence";
import { canMessage, getConnectedProfile, getConnection } from "@/lib/network";
import { isVerified } from "@/lib/verification";

export default function ConversationView() {
  const { id } = useParams();
  const { trader, loading } = useCurrentTrader();
  const [conversation, setConversation] = useState(null);
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [earlierCursor, setEarlierCursor] = useState(null);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [networked, setNetworked] = useState(true);
  const keyboardInset = useKeyboardInset();
  const bottomRef = useRef(null);
  const listRef = useRef(null);
  useChatPresence(trader?.id, id);

  useEffect(() => {
    if (!trader?.id) return;
    let cancelled = false;
    const load = async () => {
      const c = await base44.entities.Conversation.get(id);
      if (cancelled) return;
      setConversation(c);
      markRead(c, trader.id, trader.read_receipts !== false);
      const otherId = otherIdOf(c, trader.id);
      const [profile, connection, extra] = await Promise.all([
        base44.entities.Trader.get(otherId).catch(() => null),
        getConnection(trader.id, otherId).catch(() => null),
        getConnectedProfile(otherId),
      ]);
      if (cancelled) return;
      setOther(profile && { ...profile, active_at: extra?.active_at || null });
      setNetworked(canMessage(connection));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, trader?.id]);

  // Latest page once, then apply realtime events for this chat in place —
  // never refetch the whole history on every event.
  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    setEarlierCursor(null);
    loadMessagePage(id)
      .then(({ items, cursor }) => {
        if (cancelled) return;
        setMessages((current) => upsertMessages(items, current));
        setEarlierCursor(cursor);
      })
      .catch(() => {});
    const unsubscribe = base44.entities.Message.subscribe((e) => {
      if (e.type === "delete") return setMessages((list) => list.filter((m) => m.id !== e.id));
      if (e.data?.conversation_id !== id) return;
      setMessages((list) => upsertMessages(list, [{ id: e.id, ...e.data }]));
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [id]);

  const loadEarlier = async () => {
    if (!earlierCursor || loadingEarlier) return;
    setLoadingEarlier(true);
    const el = listRef.current;
    const fromBottom = el ? el.scrollHeight - el.scrollTop : 0;
    try {
      const { items, cursor } = await loadMessagePage(id, earlierCursor);
      setMessages((list) => upsertMessages(list, items));
      setEarlierCursor(cursor);
      // Keep the reader's place instead of jumping when older messages land above.
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - fromBottom;
      });
    } finally {
      setLoadingEarlier(false);
    }
  };

  // Live conversation updates: mark incoming messages read, pick up the other side's read receipt.
  useEffect(() => {
    if (!trader?.id) return;
    return base44.entities.Conversation.subscribe((e) => {
      if (e.id !== id || !e.data) return;
      setConversation(e.data);
      if (document.visibilityState === "visible") markRead(e.data, trader.id, trader.read_receipts !== false);
    });
  }, [id, trader?.id, trader?.read_receipts]);

  // Refresh the other trader's Active/Away status (private; served to connections only).
  useEffect(() => {
    if (!other?.id) return;
    const t = setInterval(
      () =>
        getConnectedProfile(other.id).then((extra) =>
          setOther((o) => o && { ...o, active_at: extra?.active_at || null })
        ),
      HEARTBEAT_MS / 2
    );
    return () => clearInterval(t);
  }, [other?.id]);

  // Follow the conversation only when a newer message arrives, not when older pages load above.
  const latestId = messages[messages.length - 1]?.id;
  useEffect(() => {
    const el = listRef.current;
    if (el && latestId) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [latestId]);

  if (loading || !conversation || !trader) return <Spinner />;

  const receiptsOn = other && trader.read_receipts !== false && other.read_receipts !== false;
  const readAt = receiptsOn ? otherReadAt(conversation, trader, other) || "" : null;
  const send = async (text) => {
    const sent = await sendMessage(conversation, text);
    if (sent?.message) setMessages((list) => upsertMessages(list, [sent.message]));
    if (sent?.conversation) setConversation(sent.conversation);
  };

  return (
    createPortal(
    <div
      className="absolute inset-x-0 z-30 flex flex-col bg-background"
      style={{ top: "calc(var(--safe-top) + var(--header-h))", bottom: `max(calc(var(--safe-bottom) + var(--tabbar-h) + 1.5rem), calc(${keyboardInset}px + 1rem))` }}
    >
      <div
        className="relative z-10 shrink-0 bg-background px-4 py-2.5 shadow-[0_4px_12px_hsl(var(--neu-dark))]"
        style={{ paddingLeft: "calc(var(--safe-left) + 1rem)", paddingRight: "calc(var(--safe-right) + 1rem)" }}
      >
        <div className="flex items-center gap-3">
          <Link to="/messages" aria-label="Back" className="neu-raised-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link
            to={other ? `/trader/${other.id}` : "#"}
            className="flex items-center gap-2.5 min-w-0 flex-1"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-secondary flex items-center justify-center shrink-0">
              {other?.profile_photo ? (
                <Image src={other.profile_photo} alt={other.full_name} className="w-full h-full" />
              ) : (
                <User className="w-4 h-4 text-muted-foreground/50" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold truncate">{other?.full_name || "Trader"}</p>
                <VerifiedBadge verified={isVerified(other)} />
              </div>
              <p className="flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground truncate">
                <span className={`h-2 w-2 shrink-0 rounded-full ${isActive(other) ? "bg-primary" : "bg-muted-foreground/40"}`} />
                {isActive(other) ? "Active" : "Away"}
                {other?.business_name && <span className="truncate">· {other.business_name}</span>}
              </p>
            </div>
          </Link>
        </div>
        {conversation.context_label && (
          <Link
            to={conversation.context_path || "#"}
            className="mt-2.5 block rounded-lg bg-accent px-3 py-1.5 text-[0.6875rem] font-medium text-accent-foreground truncate"
          >
            Chat started from: {conversation.context_label}
          </Link>
        )}
      </div>

      <div ref={listRef} className="app-scroll min-h-0 px-4 pt-4 pb-6 space-y-2">
        {earlierCursor && (
          <button
            type="button"
            onClick={loadEarlier}
            disabled={loadingEarlier}
            className="mx-auto block py-1 text-xs font-medium text-primary disabled:text-muted-foreground"
          >
            {loadingEarlier ? "Loading…" : "Show earlier messages"}
          </button>
        )}
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No messages yet — say hello and start the conversation.
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            mine={m.sender_id === trader.id}
            read={readAt === null ? undefined : !!readAt && new Date(readAt) >= new Date(m.created_date)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {networked ? (
        <MessageComposer onSend={send} />
      ) : (
        <p className="px-6 pb-4 text-center text-sm text-muted-foreground">
          Messaging unlocks once {other?.full_name || "this trader"} accepts your network request.
        </p>
      )}
    </div>,
    document.getElementById("app-shell") || document.body
    )
  );
}