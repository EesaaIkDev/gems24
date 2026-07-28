import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import SignInPrompt from "@/components/common/SignInPrompt";
import ConversationRow from "@/components/chat/ConversationRow";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { listConversations, otherIdOf, unreadFor } from "@/lib/chat";
import { MessageCircle } from "lucide-react";

export default function Messages() {
  const { user, trader, loading } = useCurrentTrader();
  const [rows, setRows] = useState(null);
  const [people, setPeople] = useState({});

  useEffect(() => {
    if (!trader?.id) return;
    let cancelled = false;
    const load = async () => {
      const conversations = await listConversations(trader.id);
      if (cancelled) return;
      setRows(conversations);
      const ids = [...new Set(conversations.map((c) => otherIdOf(c, trader.id)))];
      const traders = await Promise.all(ids.map((i) => base44.entities.Trader.get(i).catch(() => null)));
      if (!cancelled) setPeople(Object.fromEntries(ids.map((i, n) => [i, traders[n]])));
    };
    load();
    const unsubscribe = base44.entities.Conversation.subscribe(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [trader?.id]);

  if (loading) return <Spinner />;
  if (!user) return <SignInPrompt title="Sign in to Gems24" description="Sign in to message traders." />;
  if (!trader)
    return (
      <SignInPrompt
        title="Create your profile"
        description="You need a profile before you can network with traders."
        cta="Get started"
        to="/onboarding"
      />
    );
  if (rows === null) return <Spinner />;

  return (
    <div className="pt-5">
      <h1 className="px-4 text-[26px] font-bold leading-tight">Messages</h1>
      {rows.length === 0 ? (
        <div className="px-4 mt-6">
          <EmptyState
            icon={MessageCircle}
            title="No conversations yet"
            description="Tap Network on a listing or trader profile to start chatting."
          />
        </div>
      ) : (
        <div className="mt-4 divide-y divide-border border-y border-border">
          {rows.map((c) => (
            <ConversationRow
              key={c.id}
              conversation={c}
              other={people[otherIdOf(c, trader.id)]}
              unread={unreadFor(c, trader.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}