import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { User } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

export default function ConversationRow({ conversation, other, unread }) {
  const stamp = conversation.last_message_at || conversation.created_date;

  return (
    <Link
      to={`/messages/${conversation.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center shrink-0">
        {other?.profile_photo ? (
          <Image src={other.profile_photo} alt={other.full_name} className="w-full h-full" />
        ) : (
          <User className="w-5 h-5 text-muted-foreground/50" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold truncate">{other?.full_name || "Trader"}</p>
          <span className="ml-auto text-[11px] text-muted-foreground shrink-0">
            {stamp ? formatDistanceToNowStrict(new Date(stamp)) : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className={`text-sm truncate ${unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {conversation.last_message || "Say hello 👋"}
          </p>
          {unread > 0 && (
            <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-[11px] font-bold text-primary-foreground flex items-center justify-center shrink-0">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}