import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MessageCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findOrCreateConversation } from "@/lib/chat";
import { canMessage, getConnection, networkWith } from "@/lib/network";
import { haptic } from "@/lib/despia";

/**
 * Follow-style network button. Connects the viewer to a trader, then opens the
 * chat — unless that trader requires approval before messaging, in which case
 * the request stays pending.
 */
export default function NetworkButton({ viewerId, other, connection, context, className = "", size }) {
  const navigate = useNavigate();
  const [conn, setConn] = useState(connection ?? null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (connection !== undefined) setConn(connection);
    else if (viewerId && other?.id) getConnection(viewerId, other.id).then(setConn);
  }, [connection, viewerId, other?.id]);

  if (!viewerId || !other?.id || viewerId === other.id) return null;

  const openChat = async () => {
    setBusy(true);
    const conversation = await findOrCreateConversation(viewerId, other.id, context);
    navigate(`/messages/${conversation.id}`);
  };

  const onClick = async () => {
    haptic("light");
    if (canMessage(conn)) return openChat();
    if (conn?.status === "pending") return;
    const created = await networkWith(viewerId, other);
    setConn(created);
    if (canMessage(created)) openChat();
  };

  const pending = conn?.status === "pending";
  const connected = canMessage(conn);
  const Icon = pending ? Clock : connected ? MessageCircle : UserPlus;
  const label = pending ? "Requested" : "Network";

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={busy || pending}
      variant={pending ? "secondary" : "default"}
      size={size}
      className={className}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );
}