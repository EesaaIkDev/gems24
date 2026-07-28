import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { findOrCreateConversation } from "@/lib/chat";
import { haptic } from "@/lib/despia";
import NetworkLoader from "./NetworkLoader";

/** Opens (or starts) the one-to-one chat with another trader. */
export default function NetworkButton({ viewerId, otherId, context, className = "", label = "Network" }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  if (!viewerId || !otherId || viewerId === otherId) return null;

  const open = async () => {
    setBusy(true);
    haptic("light");
    // let the fill drain and the label lift away before the gem appears
    setTimeout(() => setShowLoader(true), 550);
    const [conversation] = await Promise.all([
      findOrCreateConversation(viewerId, otherId, context),
      new Promise((r) => setTimeout(r, 4550)),
    ]);
    navigate(`/messages/${conversation.id}`);
  };

  return (
    <button
      type="button"
      onClick={open}
      disabled={busy}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-md border-2 text-sm font-semibold transition-[background-color,border-color,color] duration-700 ease-out disabled:cursor-default ${
        busy
          ? "border-primary bg-transparent text-primary"
          : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
      } ${className}`}
    >
      <span
        className={`inline-flex items-center transition-all duration-500 ease-out ${
          busy ? "opacity-0 -translate-y-2 scale-90" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
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