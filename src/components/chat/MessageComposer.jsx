import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function MessageComposer({ onSend }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    setText("");
    await onSend(value);
    setBusy(false);
  };

  return (
    <form
      onSubmit={submit}
      className="glass-chrome fixed inset-x-0 z-40 px-3 py-2.5 shadow-[0_-4px_12px_hsl(var(--neu-dark))]"
      style={{ bottom: "calc(var(--safe-bottom) + var(--tabbar-h))", paddingLeft: "calc(var(--safe-left) + 0.75rem)", paddingRight: "calc(var(--safe-right) + 0.75rem)" }}
    >
      <div className="max-w-6xl mx-auto flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
          className="h-12 flex-1 min-w-0 rounded-full px-4 text-base"
        />
        <Button type="submit" size="icon" aria-label="Send" className="h-12 w-12 shrink-0 rounded-full" disabled={!text.trim() || busy}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}