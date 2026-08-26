import { useEffect, useState } from "react";
import { ensureReferralCode } from "@/lib/referral";

/** Resolves the trader's referral code, back-filling one if they don't have it. */
export default function useReferralCode(trader) {
  const [code, setCode] = useState(trader?.referral_code || "");

  useEffect(() => {
    if (!trader?.id) return;
    if (trader.referral_code) {
      setCode(trader.referral_code);
      return;
    }
    ensureReferralCode(trader).then((c) => c && setCode(c));
  }, [trader?.id, trader?.referral_code]);

  return code;
}