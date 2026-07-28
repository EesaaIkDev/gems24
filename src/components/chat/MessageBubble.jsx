import React from "react";
import { format } from "date-fns";

export default function MessageBubble({ message, mine }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${
          mine
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-secondary text-foreground rounded-bl-md"
        }`}
      >
        <p className="text-[0.9375rem] leading-snug whitespace-pre-wrap break-words">{message.text}</p>
        <p className={`mt-1 text-[0.625rem] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {format(new Date(message.created_date), "HH:mm")}
        </p>
      </div>
    </div>
  );
}