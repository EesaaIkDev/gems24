import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";

/** Permanently removes the trader's personal data, listings, chats and connections. */
export default function DeleteAccount({ trader }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const runDelete = async () => {
    setBusy(true);
    setError("");
    try {
      const [asA, asB, sent, received] = await Promise.all([
        base44.entities.Conversation.filter({ participant_a_id: trader.id }),
        base44.entities.Conversation.filter({ participant_b_id: trader.id }),
        base44.entities.Connection.filter({ requester_id: trader.id }),
        base44.entities.Connection.filter({ recipient_id: trader.id }),
      ]);
      const conversations = [...asA, ...asB];
      const messageBatches = await Promise.all(
        conversations.map((c) => base44.entities.Message.filter({ conversation_id: c.id }))
      );
      await Promise.all([
        ...messageBatches.flat().map((m) => base44.entities.Message.delete(m.id)),
        // Every stone this trader ever published goes in the same pass, in one
        // call — no page limit can leave listings orphaned behind the profile.
        base44.entities.Listing.deleteMany({ trader_id: trader.id }),
        ...[...sent, ...received].map((c) => base44.entities.Connection.delete(c.id)),
      ]);
      await Promise.all(conversations.map((c) => base44.entities.Conversation.delete(c.id)));
      await base44.entities.Trader.delete(trader.id);
      base44.auth.logout("/");
    } catch (err) {
      setError(err.message || "Deletion failed. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="neu-raised rounded-2xl bg-background p-4">
      <div className="flex items-center gap-2">
        <Trash2 className="h-[18px] w-[18px] text-destructive" />
        <p className="text-sm font-medium">Delete my account</p>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Permanently erases your personal data — this cannot be undone.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-3 h-11 w-full text-destructive">
            Delete my account
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your Gems24 account?</DialogTitle>
            <DialogDescription>Here is exactly what happens when you confirm:</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-[0.8125rem] leading-snug text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Your profile</span> — name, business name,
              photo, location, bio and contact details are deleted, and you disappear from Gemstones
              search and every feed.
            </li>
            <li>
              <span className="font-medium text-foreground">Your listings</span> — all of your stones
              are deleted and stop appearing to other users.
            </li>
            <li>
              <span className="font-medium text-foreground">Your messages</span> — every conversation
              you took part in is deleted for you <em>and</em> for the trader on the other side, so
              your chats are no longer visible to anyone.
            </li>
            <li>
              <span className="font-medium text-foreground">Your connections</span> — all accepted and
              pending requests are removed, so previously connected traders lose access to your
              contact details.
            </li>
            <li>
              <span className="font-medium text-foreground">Your subscription</span> — cancel any paid
              plan in the store before deleting; deleting here does not refund it.
            </li>
          </ul>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Type DELETE to confirm.</p>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" className="h-11" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" className="h-11" onClick={() => setOpen(false)} disabled={busy}>
              Keep my account
            </Button>
            <Button
              variant="destructive"
              className="h-11"
              onClick={runDelete}
              disabled={busy || confirm.trim().toUpperCase() !== "DELETE"}
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {busy ? "Deleting…" : "Permanently delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}