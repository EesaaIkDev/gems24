import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cap } from "@/lib/gems";

const STATUS = {
  new: "bg-primary/10 text-primary",
  responded: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  closed: "bg-muted text-muted-foreground",
};

export default function EnquiryRow({ enquiry, received, onStatus }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/listing/${enquiry.listing_id}`} className="font-semibold text-[15px] hover:text-primary">
            {enquiry.listing_summary || "Listing"}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {received ? `From ${enquiry.enquirer_name}` : "Enquiry you sent"}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS[enquiry.status]}`}>
          {cap(enquiry.status)}
        </span>
      </div>

      <p className="mt-3 text-sm text-foreground/80 whitespace-pre-line">{enquiry.message}</p>

      {received && (
        <>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <a href={`mailto:${enquiry.enquirer_email}`} className="flex items-center gap-1.5 hover:text-primary">
              <Mail className="w-3.5 h-3.5" /> {enquiry.enquirer_email}
            </a>
            {enquiry.enquirer_phone && (
              <a href={`tel:${enquiry.enquirer_phone}`} className="flex items-center gap-1.5 hover:text-primary">
                <Phone className="w-3.5 h-3.5" /> {enquiry.enquirer_phone}
              </a>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            {enquiry.status !== "responded" && (
              <Button variant="outline" size="sm" onClick={() => onStatus(enquiry, "responded")}>
                Mark responded
              </Button>
            )}
            {enquiry.status !== "closed" && (
              <Button variant="ghost" size="sm" onClick={() => onStatus(enquiry, "closed")}>
                Close
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}