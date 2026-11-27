import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder chat list while conversations load. */
export default function ConversationListSkeleton({ count = 6 }) {
  return (
    <div className="pt-5" aria-busy="true" aria-label="Loading chats">
      <Skeleton className="mx-4 h-7 w-24" />
      <Skeleton className="mx-4 mt-4 h-12 rounded-full" />
      <div className="mt-4 divide-y divide-border border-y border-border">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}