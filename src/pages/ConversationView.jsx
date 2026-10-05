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
import { isActive, markRead, otherIdOf, otherReadAt, sendMessage } from "@/lib/chat";
import { canMessage, getConnection } from "@/lib/network";
import { isVerified } from "@/lib/verification";

export default function ConversationView() {
  const { id } = useParams();
  const { trader, loading } = useCurrentTrader();
  const [conversation, setConversation] = useState(null);
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
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
      setOther(await base44.entities.Trader.get(otherId).catch(() => null));
      const connection = await getConnection(trader.id, otherId).catch(() => null);
      if (!cancelled) setNetworked(canMessage(connection));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, trader?.id]);

  useEffect(() => {
    const loadMessages = () =>
      base44.entities.Message.filter({ conversation_id: id }, "created_date", 500).then(setMessages);
    loadMessages();
    const unsubscribe = base44.entities.Message.subscribe(loadMessages);
    return unsubscribe;
  }, [id]);

  // Live conversation updates: mark incoming messages read, pick up the other side's read receipt.
  useEffect(() => {
    if (!trader?.id) return;
    return base44.entities.Conversation.subscribe((e) => {
      if (e.id !== id || !e.data) return;
      setConversation(e.data);
      if (document.visibilityState === "visible") markRead(e.data, trader.id, trader.read_receipts !== false);
    });
  }, [id, trader?.id, trader?.read_receipts]);

  // Refresh the other trader's Active/Away status.
  useEffect(() => {
    if (!other?.id) return;
    const t = setInterval(() => base44.entities.Trader.get(other.id).then(setOther).catch(() => {}), 60000);
    return () => clearInterval(t);
  }, [other?.id]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  if (loading || !conversation || !trader) return <Spinner />;

  const receiptsOn = other && trader.read_receipts !== false && other.read_receipts !== false;
  const readAt = receiptsOn ? otherReadAt(conversation, trader, other) || "" : null;
  const send = async (text) => {
    await sendMessage(conversation, trader.id, text);
    setConversation(await base44.entities.Conversation.get(id));
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