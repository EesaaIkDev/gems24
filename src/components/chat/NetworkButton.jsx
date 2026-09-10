import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Clock, MessageCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findOrCreateConversation } from "@/lib/chat";
import {
  canMessage,
  getConnection,
  isAwaitingMyApproval,
  isAwaitingTheirApproval,
  networkWith,
} from "@/lib/network";
import { haptic } from "@/lib/despia";

/**
 * Request-and-accept network button. Tapping it sends a request that the other
 * trader has to accept — nobody is connected automatically. Once accepted the
 * same button opens the chat.
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

  const connected = canMessage(conn);
  const theirTurn = isAwaitingTheirApproval(conn, viewerId);
  const myTurn = isAwaitingMyApproval(conn, viewerId);

  const openChat = async () => {
    setBusy(true);
    const conversation = await findOrCreateConversation(viewerId, other.id, context);
    navigate(`/messages/${conversation.id}`);
  };

  const onClick = async () => {
    haptic("light");
    if (connected) return openChat();
    // Pending either way: nothing to do here. Incoming requests are answered
    // from the Requests tab in Chats.
    if (theirTurn) return;
    if (myTurn) return navigate("/messages");
    setBusy(true);
    const created = await networkWith(viewerId, other);
    setConn(created);
    setBusy(false);
  };

  const { Icon, label } = connected
    ? { Icon: MessageCircle, label: "Message" }
    : myTurn
      ? { Icon: Check, label: "Respond to request" }
      : theirTurn
        ? { Icon: Clock, label: "Request sent" }
        : { Icon: UserPlus, label: "Request to network" };

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={busy || theirTurn}
      variant={connected ? "default" : theirTurn ? "secondary" : "default"}
      size={size}
      className={className}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );
}
