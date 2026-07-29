import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import TraderCard from "@/components/traders/TraderCard";
import EmptyState from "@/components/common/EmptyState";

/** Incoming network requests awaiting the viewer's approval before messaging. */
export default function RequestsList({ requests, onRespond }) {
  if (!requests.length) {
    return (
      <EmptyState
        icon={UserPlus}
        title="No pending requests"
        description="Traders who need your approval before messaging will appear here."
      />
    );
  }

  return (
    <div className="px-4 space-y-4">
      {requests.map(({ connection, trader }) => (
        <div key={connection.id} className="space-y-2">
          <TraderCard trader={trader} />
          <div className="flex gap-2">
            <Button className="flex-1 h-11 font-semibold" onClick={() => onRespond(connection, "accepted")}>
              Accept
            </Button>
            <Button variant="outline" className="flex-1 h-11" onClick={() => onRespond(connection, "declined")}>
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}