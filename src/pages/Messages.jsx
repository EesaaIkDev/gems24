import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import SignInPrompt from "@/components/common/SignInPrompt";
import ConversationRow from "@/components/chat/ConversationRow";
import RequestsList from "@/components/chat/RequestsList";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { listConversations, otherIdOf, unreadFor } from "@/lib/chat";
import { listIncomingRequests, respondToRequest } from "@/lib/network";
import { MessageCircle } from "lucide-react";

export default function Messages() {
  const { user, trader, loading } = useCurrentTrader();
  const [rows, setRows] = useState(null);
  const [people, setPeople] = useState({});
  const [requests, setRequests] = useState([]);

  const loadRequests = useCallback(async () => {
    if (!trader?.id) return;
    const pending = await listIncomingRequests(trader.id);
    const traders = await Promise.all(
      pending.map((c) => base44.entities.Trader.get(c.requester_id).catch(() => null))
    );
    setRequests(pending.map((c, i) => ({ connection: c, trader: traders[i] })).filter((r) => r.trader));
  }, [trader?.id]);

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
    loadRequests();
    const unsubscribe = base44.entities.Conversation.subscribe(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [trader?.id, loadRequests]);

  const respond = async (connection, status) => {
    await respondToRequest(connection.id, status);
    loadRequests();
  };

  if (loading) return <Spinner />;
  if (!user) return <SignInPrompt title="Sign in to Gems24" description="Sign in to chat with traders." />;
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
      <h1 className="px-4 text-[1.625rem] font-bold leading-tight">Chats</h1>

      <Tabs defaultValue="chats" className="mt-4">
        <TabsList className="mx-4 grid grid-cols-2 h-11 rounded-xl" style={{ width: "calc(100% - 2rem)" }}>
          <TabsTrigger value="chats" className="rounded-lg">Chats</TabsTrigger>
          <TabsTrigger value="requests" className="rounded-lg">
            Requests{requests.length ? ` (${requests.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="mt-4">
          {rows.length === 0 ? (
            <div className="px-4">
              <EmptyState
                icon={MessageCircle}
                title="No conversations yet"
                description="Tap Network on a listing or trader profile to start chatting."
              />
            </div>
          ) : (
            <div className="divide-y divide-border border-y border-border">
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
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <RequestsList requests={requests} onRespond={respond} />
        </TabsContent>
      </Tabs>
    </div>
  );
}