import React from "react";
import { BadgeCheck, ShieldAlert } from "lucide-react";

/** Tells browsers whether the seller is verified, in place of their plan. */
export default function SellerVerification({ verified, className = "" }) {
  return verified ? (
    <span className={`inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-primary ${className}`}>
      <BadgeCheck className="h-3.5 w-3.5" /> Verified seller
    </span>
  ) : (
    <span className={`inline-flex items-center gap-1 text-[0.6875rem] font-medium text-muted-foreground ${className}`}>
      <ShieldAlert className="h-3.5 w-3.5" /> Not verified
    </span>
  );
}