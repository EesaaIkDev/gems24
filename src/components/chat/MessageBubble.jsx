import React from "react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Check, CheckCheck } from "lucide-react";

export default function MessageBubble({ message, mine, deliveryStatus = "sent" }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${
          mine
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-secondary text-foreground rounded-bl-md"
        }`}
      >
        <div className="text-[0.9375rem] leading-snug break-words selectable [&_p]:whitespace-pre-wrap [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
        <p className={`mt-1 flex items-center justify-end gap-1 text-[0.625rem] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {format(new Date(message.created_date), "HH:mm")}
          {mine && (deliveryStatus === "read"
            ? <CheckCheck className="w-3.5 h-3.5 text-emerald-300" role="img" aria-label="Read" />
            : deliveryStatus === "delivered"
              ? <CheckCheck className="w-3.5 h-3.5" role="img" aria-label="Delivered" />
              : <Check className="w-3.5 h-3.5" role="img" aria-label="Sent, not delivered" />)}
        </p>
      </div>
    </div>
  );
}