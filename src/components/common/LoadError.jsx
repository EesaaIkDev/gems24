import React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoadError({
  title = "Couldn't load this",
  description = "Check your connection and try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
        <RotateCcw className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="mt-4 font-heading text-base font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-[16rem] text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button className="mt-5 h-11 px-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}