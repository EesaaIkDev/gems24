import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cap } from "@/lib/gems";

export default function EnquiryDialog({ open, onOpenChange, listing, trader, viewer }) {
  const [form, setForm] = useState({
    enquirer_name: viewer?.full_name || "",
    enquirer_email: viewer?.contact_email || viewer?.email || "",
    enquirer_phone: viewer?.phone || "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.enquirer_name || !form.enquirer_email || !form.message) {
      setError("Please fill in your name, email and a message.");
      return;
    }
    setSending(true);
    try {
      await base44.entities.Enquiry.create({
        ...form,
        listing_id: listing.id,
        listing_summary: `${listing.weight_carats} ct ${cap(listing.gemstone_type)}`,
        owner_trader_id: listing.trader_id,
        enquirer_trader_id: viewer?.id || "",
        status: "new",
      });
      setDone(true);
    } catch {
      setError("Could not send your enquiry. Please try again.");
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        {done ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <h3 className="mt-4 text-lg font-semibold">Enquiry sent</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {trader?.full_name || "The trader"} has been notified and will get back to you.
            </p>
            <Button className="mt-6 w-full h-11" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enquire about this stone</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <Input
                placeholder="Your name"
                value={form.enquirer_name}
                onChange={(e) => setForm({ ...form, enquirer_name: e.target.value })}
                className="h-11"
              />
              <Input
                type="email"
                placeholder="Your email"
                value={form.enquirer_email}
                onChange={(e) => setForm({ ...form, enquirer_email: e.target.value })}
                className="h-11"
              />
              <Input
                placeholder="Phone (optional)"
                value={form.enquirer_phone}
                onChange={(e) => setForm({ ...form, enquirer_phone: e.target.value })}
                className="h-11"
              />
              <Textarea
                placeholder="Tell the trader what you're looking for…"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={sending} className="w-full h-12 text-base font-semibold">
                {sending ? "Sending…" : "Send enquiry"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}