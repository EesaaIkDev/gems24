import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Clock, MessageCircle, UserPlus } from "lucide-react";
import { findOrCreateConversation } from "@/lib/chat";
import { canMessage, getConnection, networkWith } from "@/lib/network";
import { haptic } from "@/lib/despia";
import NetworkLoader from "./NetworkLoader";

/**
 * Follow-style network button. Connects the viewer to a trader, then opens the
 * chat — unless that trader requires approval before messaging, in which case
 * the request stays pending.
 */
export default function NetworkButton({ viewerId, other, connection, context, className = "" }) {
  const navigate = useNavigate();
  const [conn, setConn] = useState(connection ?? null);
  const [busy, setBusy] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (connection !== undefined) setConn(connection);
    else if (viewerId && other?.id) getConnection(viewerId, other.id).then(setConn);
  }, [connection, viewerId, other?.id]);

  if (!viewerId || !other?.id || viewerId === other.id) return null;

  const openChat = async () => {
    setBusy(true);
    // let the fill drain and the label lift away before the gem appears
    setTimeout(() => setShowLoader(true), 550);
    const [conversation] = await Promise.all([
      findOrCreateConversation(viewerId, other.id, context),
      new Promise((r) => setTimeout(r, 4550)),
    ]);
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
  const label = pending ? "Requested" : connected ? "Message" : "Network";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || pending}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-md border-2 text-sm font-semibold transition-[background-color,border-color,color] duration-700 ease-out disabled:cursor-default ${
        busy
          ? "border-primary bg-transparent text-primary"
          : pending
          ? "border-border bg-secondary text-muted-foreground"
          : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
      } ${className}`}
    >
      <span
        className={`inline-flex items-center transition-all duration-500 ease-out ${
          busy ? "opacity-0 -translate-y-2 scale-90" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        <Icon className="w-4 h-4 mr-2" />
        {label}
      </span>

      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
          showLoader ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        {showLoader && <NetworkLoader size={28} />}
      </span>
    </button>
  );
}