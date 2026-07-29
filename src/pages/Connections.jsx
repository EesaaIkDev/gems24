import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import TraderCard from "@/components/traders/TraderCard";
import EmptyState from "@/components/common/EmptyState";
import Spinner from "@/components/common/Spinner";
import SignInPrompt from "@/components/common/SignInPrompt";
import useCurrentTrader from "@/hooks/useCurrentTrader";

export default function Connections() {
  const { user, trader, loading } = useCurrentTrader();
  const [data, setData] = useState({ accepted: [], incoming: [], outgoing: [] });
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!trader?.id) return;
    const all = await base44.entities.Connection.list("-created_date", 300);
    const mine = all.filter((c) => c.requester_id === trader.id || c.recipient_id === trader.id);
    const ids = [...new Set(mine.flatMap((c) => [c.requester_id, c.recipient_id]))].filter((i) => i !== trader.id);
    const traders = await Promise.all(ids.map((i) => base44.entities.Trader.get(i).catch(() => null)));
    const byId = Object.fromEntries(traders.filter(Boolean).map((t) => [t.id, t]));
    const other = (c) => byId[c.requester_id === trader.id ? c.recipient_id : c.requester_id];

    setData({
      accepted: mine.filter((c) => c.status === "accepted").map((c) => ({ c, t: other(c) })).filter((x) => x.t),
      incoming: mine
        .filter((c) => c.status === "pending" && c.recipient_id === trader.id)
        .map((c) => ({ c, t: byId[c.requester_id] }))
        .filter((x) => x.t),
      outgoing: mine
        .filter((c) => c.status === "pending" && c.requester_id === trader.id)
        .map((c) => ({ c, t: byId[c.recipient_id] }))
        .filter((x) => x.t),
    });
    setReady(true);
  }, [trader?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (c, status) => {
    await base44.entities.Connection.update(c.id, { status });
    load();
  };

  if (loading) return <Spinner />;
  if (!user) return <SignInPrompt title="Sign in to see your network" />;
  if (!trader) return <SignInPrompt title="Create your profile first" cta="Get started" to="/onboarding" />;

  return (
    <div className="px-4 pt-5">
      <h1 className="text-[26px] font-bold leading-tight">My connections</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Once a connection is accepted, you can both see each other's contact details.
      </p>

      <Tabs defaultValue="accepted" className="mt-5">
        <TabsList className="grid grid-cols-3 w-full h-11 rounded-xl">
          <TabsTrigger value="accepted" className="rounded-lg">Connected</TabsTrigger>
          <TabsTrigger value="incoming" className="rounded-lg">Requests ({data.incoming.length})</TabsTrigger>
          <TabsTrigger value="outgoing" className="rounded-lg">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="accepted" className="mt-4 space-y-3">
          {!ready ? (
            <Spinner />
          ) : data.accepted.length === 0 ? (
            <EmptyState icon={Users} title="No connections yet" description="Find traders under Gemstones and tap Network to connect." />
          ) : (
            data.accepted.map(({ t }) => <TraderCard key={t.id} trader={t} />)
          )}
        </TabsContent>

        <TabsContent value="incoming" className="mt-4 space-y-3">
          {data.incoming.length === 0 ? (
            <EmptyState icon={Users} title="No pending requests" />
          ) : (
            data.incoming.map(({ c, t }) => (
              <div key={c.id} className="space-y-2">
                <TraderCard trader={t} />
                <div className="flex gap-2">
                  <Button className="flex-1 h-11 font-semibold" onClick={() => respond(c, "accepted")}>Accept</Button>
                  <Button variant="outline" className="flex-1 h-11" onClick={() => respond(c, "declined")}>Decline</Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="mt-4 space-y-3">
          {data.outgoing.length === 0 ? (
            <EmptyState icon={Users} title="No sent requests" />
          ) : (
            data.outgoing.map(({ c, t }) => (
              <div key={c.id}>
                <TraderCard trader={t} />
                <p className="mt-1.5 text-xs text-muted-foreground px-1">Awaiting response</p>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}