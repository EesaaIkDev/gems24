import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";
import EnquiryRow from "@/components/enquiries/EnquiryRow";
import EmptyState from "@/components/common/EmptyState";
import Spinner from "@/components/common/Spinner";
import SignInPrompt from "@/components/common/SignInPrompt";
import useCurrentTrader from "@/hooks/useCurrentTrader";

export default function Enquiries() {
  const { user, trader, loading } = useCurrentTrader();
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!trader?.id) return;
    const [r, s] = await Promise.all([
      base44.entities.Enquiry.filter({ owner_trader_id: trader.id }, "-created_date", 100),
      base44.entities.Enquiry.filter({ enquirer_trader_id: trader.id }, "-created_date", 100),
    ]);
    setReceived(r);
    setSent(s);
    setReady(true);
  }, [trader?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (enquiry, status) => {
    await base44.entities.Enquiry.update(enquiry.id, { status });
    load();
  };

  if (loading) return <Spinner />;
  if (!user) return <SignInPrompt title="Sign in to see your enquiries" />;
  if (!trader) return <SignInPrompt title="Finish setting up your profile" cta="Set up profile" to="/onboarding" />;

  return (
    <div className="px-4 pt-5">
      <h1 className="text-[26px] font-bold leading-tight">My enquiries</h1>
      <p className="text-sm text-muted-foreground mt-1">Leads you've received and enquiries you've sent.</p>

      <Tabs defaultValue="received" className="mt-5">
        <TabsList className="grid grid-cols-2 w-full h-11 rounded-xl">
          <TabsTrigger value="received" className="rounded-lg">Received ({received.length})</TabsTrigger>
          <TabsTrigger value="sent" className="rounded-lg">Sent ({sent.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-4 space-y-3">
          {!ready ? (
            <Spinner />
          ) : received.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No enquiries yet" description="When a buyer enquires about one of your listings, it'll appear here." />
          ) : (
            received.map((e) => <EnquiryRow key={e.id} enquiry={e} received onStatus={setStatus} />)
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-4 space-y-3">
          {sent.length === 0 ? (
            <EmptyState icon={MessageSquare} title="Nothing sent yet" description="Browse listings and tap Enquire to reach out to a trader." />
          ) : (
            sent.map((e) => <EnquiryRow key={e.id} enquiry={e} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}