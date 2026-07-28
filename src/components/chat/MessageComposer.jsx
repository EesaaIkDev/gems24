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
      className="fixed bottom-16 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl px-4 py-2.5"
    >
      <div className="max-w-6xl mx-auto flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
          className="h-11 rounded-full"
        />
        <Button type="submit" size="icon" className="h-11 w-11 rounded-full shrink-0" disabled={!text.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}