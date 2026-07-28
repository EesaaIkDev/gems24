import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { findOrCreateConversation } from "@/lib/chat";
import { haptic } from "@/lib/despia";

/** Opens (or starts) the one-to-one chat with another trader. */
export default function NetworkButton({ viewerId, otherId, context, className = "", label = "Network" }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (!viewerId || !otherId || viewerId === otherId) return null;

  const open = async () => {
    setBusy(true);
    haptic("light");
    const conversation = await findOrCreateConversation(viewerId, otherId, context);
    navigate(`/messages/${conversation.id}`);
  };

  return (
    <Button className={`font-semibold ${className}`} onClick={open} disabled={busy}>
      <MessageCircle className="w-4 h-4 mr-2" />
      {busy ? "Opening…" : label}
    </Button>
  );
}