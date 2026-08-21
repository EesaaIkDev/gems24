import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { ArrowLeft, User } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import MessageBubble from "@/components/chat/MessageBubble";
import MessageComposer from "@/components/chat/MessageComposer";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { markRead, otherIdOf, sendMessage } from "@/lib/chat";

export default function ConversationView() {
  const { id } = useParams();
  const { trader, loading } = useCurrentTrader();
  const [conversation, setConversation] = useState(null);
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!trader?.id) return;
    let cancelled = false;
    const load = async () => {
      const c = await base44.entities.Conversation.get(id);
      if (cancelled) return;
      setConversation(c);
      markRead(c, trader.id);
      setOther(await base44.entities.Trader.get(otherIdOf(c, trader.id)).catch(() => null));
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (loading || !conversation || !trader) return <Spinner />;

  const send = async (text) => {
    await sendMessage(conversation, trader.id, text);
    setConversation(await base44.entities.Conversation.get(id));
  };

  return (
    <div className="pb-32">
      <div className="sticky top-0 z-20 glass-chrome border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/messages" className="text-muted-foreground hover:text-primary">
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
                <VerifiedBadge verified={other?.verified} />
              </div>
              {other?.business_name && (
                <p className="text-[0.6875rem] text-muted-foreground truncate">{other.business_name}</p>
              )}
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

      <div className="px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No messages yet — say hello and start the conversation.
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} mine={m.sender_id === trader.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageComposer onSend={send} />
    </div>
  );
}