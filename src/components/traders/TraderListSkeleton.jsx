import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder rows shaped like TraderCard. */
export default function TraderListSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-busy="true" aria-label="Loading traders">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3.5 rounded-xl border border-border bg-card p-3.5">
          <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}