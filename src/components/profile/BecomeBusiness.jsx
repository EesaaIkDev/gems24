import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Building2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import BottomSheet from "@/components/ui/bottom-sheet";
import BusinessFields, { EMPTY_BUSINESS } from "@/components/traders/BusinessFields";
import { businessDetails } from "@/components/traders/ProfileWizard";
import useOnline from "@/hooks/useOnline";
import useErrorHaptic from "@/hooks/useErrorHaptic";
import { haptic } from "@/lib/despia";
import { TIERS } from "@/lib/gems";

const POINTS = [
  "A company profile with your registered name, business type and team",
  "The Platinum business plan: 300 listings and top placement",
  "Verified Business badge once your company passes business verification",
];

/** One-way individual → business switch, shown to individual traders on their profile. */
export default function BecomeBusiness({ trader, onUpgraded }) {
  const navigate = useNavigate();
  const online = useOnline();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_BUSINESS, business_name: trader.business_name || "" });
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  useErrorHaptic(error);

  const set = (k, v) => {
    setError("");
    setForm((f) => ({ ...f, [k]: v }));
  };

  const confirm = async () => {
    if (form.legal_business_name.trim().length < 2) return setError("Enter your registered business name.");
    haptic("heavy");
    setWorking(true);
    try {
      const { data } = await base44.functions.invoke("upgradeToBusiness", businessDetails(form));
      if (data?.state === "upgraded" || data?.state === "already_business") {
        haptic("success");
        setOpen(false);
        await onUpgraded();
        navigate("/subscription");
        return;
      }
      setError(data?.error || "Something went wrong — please try again.");
    } catch (err) {
      setError(err?.response?.data?.error || "Could not switch your account. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  const plan = trader.subscription_tier && trader.subscription_tier !== "none" ? TIERS[trader.subscription_tier]?.label : "";

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2.5">
          <Building2 className="h-[18px] w-[18px] text-primary" />
          <h2 className="text-sm font-semibold">Trading as a business?</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Gold is the highest plan for individual traders. Registered businesses get a company profile and the Platinum
          business plan.
        </p>
        <Button variant="outline" className="mt-4 h-11 w-full" onClick={() => setOpen(true)}>
          Switch to a business account
        </Button>
      </div>

      <BottomSheet open={open} onOpenChange={setOpen} title="Switch to a business account">
        <div className="mx-auto max-w-md space-y-4 pb-2">
          <ul className="space-y-1.5">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
                <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {p}
              </li>
            ))}
          </ul>

          <BusinessFields form={form} set={set} />

          <p className="text-xs leading-relaxed text-muted-foreground">
            No documents needed now — business verification happens later through our partner, Shufti Pro.
            {plan && ` Your ${plan} plan stays active until it ends; business accounts renew on Platinum.`} This can't
            be undone — you can't switch back to an individual account.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Button className="h-11 w-full" onClick={confirm} disabled={working || !online}>
              {working && <Loader2 className="w-4 h-4 animate-spin" />}
              {!online ? "Unavailable offline" : "Confirm switch"}
            </Button>
            <Button variant="outline" className="h-11 w-full" onClick={() => setOpen(false)} disabled={working}>
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
