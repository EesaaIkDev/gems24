import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { findOrCreateConversation } from "@/lib/chat";
import { haptic } from "@/lib/despia";
import NetworkLoader from "./NetworkLoader";

/** Opens (or starts) the one-to-one chat with another trader. */
export default function NetworkButton({ viewerId, otherId, context, className = "", label = "Network" }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (!viewerId || !otherId || viewerId === otherId) return null;

  const open = async () => {
    setBusy(true);
    haptic("light");
    const [conversation] = await Promise.all([
      findOrCreateConversation(viewerId, otherId, context),
      new Promise((r) => setTimeout(r, 4000)),
    ]);
    navigate(`/messages/${conversation.id}`);
  };

  if (busy) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border-2 border-primary bg-transparent ${className}`}
      >
        <NetworkLoader size={26} />
      </div>
    );
  }

  return (
    <Button className={`font-semibold ${className}`} onClick={open}>
      <MessageCircle className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}