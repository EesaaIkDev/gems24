import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import { LEVEL_LABEL } from "@/lib/verification";

/**
 * Accounts waiting on a Gems24 admin: AML matches on the first screening, and
 * approved accounts that ongoing monitoring flagged. Nothing is revoked until
 * an admin decides here. Server-side the reviewVerification function checks
 * the admin role, so this page is a convenience, not the control.
 */
export default function AdminVerifications() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [notes, setNotes] = useState({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await base44.functions.invoke("reviewVerification", { action: "list" });
      setRows(data.rows || []);
    } catch {
      setError("Couldn't load the review queue.");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user?.role, load]);

  const act = async (row, action) => {
    setBusy(`${row.trader_id}:${action}`);
    setError("");
    try {
      await base44.functions.invoke("reviewVerification", { action, trader_id: row.trader_id, note: notes[row.trader_id] || "" });
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || "That didn't work. Please try again.");
    }
    setBusy("");
  };

  if (user?.role !== "admin")
    return <EmptyState icon={ShieldAlert} title="Admins only" description="You don't have access to this page." />;
  if (rows === null) return <Spinner />;

  return (
    <div className="px-4 pt-5 pb-10 max-w-2xl mx-auto space-y-4">
      <Link to="/settings" className="text-sm text-muted-foreground hover:text-primary">← Settings</Link>
      <h1 className="text-[1.5rem] font-bold leading-tight">Verification review</h1>
      <p className="text-sm text-muted-foreground">
        Possible AML matches from Shufti. Check the case in the Shufti back office (search by reference) before deciding.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {rows.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="Nothing to review" description="No accounts are waiting on a decision." />
      ) : (
        rows.map((r) => {
          const first = r.kind === "first_screening";
          return (
            <div key={r.trader_id} className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{r.name || r.trader_id}</p>
                <span className="ml-auto text-[0.6875rem] font-semibold uppercase tracking-wider text-destructive">
                  {first ? "First screening" : "Flagged after approval"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {LEVEL_LABEL[r.level] || r.level} · KYC {r.kyc_status} · KYB {r.kyb_status} · AML {r.aml_status}
              </p>
              <p className="text-xs">{r.reason}</p>
              <p className="text-[0.6875rem] text-muted-foreground selectable">Shufti reference: {r.shufti_reference}</p>
              <Input
                placeholder="Note for the audit log"
                value={notes[r.trader_id] || ""}
                onChange={(e) => setNotes((n) => ({ ...n, [r.trader_id]: e.target.value }))}
                className="h-10"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled={!!busy} onClick={() => act(r, first ? "approve" : "clear_flag")}>
                  {first ? "False positive — approve" : "False positive — keep badge"}
                </Button>
                <Button variant="destructive" disabled={!!busy} onClick={() => act(r, first ? "decline" : "revoke")}>
                  {first ? "Confirmed — decline" : "Confirmed — revoke badge"}
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
