import React, { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import FormattingToolbar from "@/components/chat/FormattingToolbar";
import formatSelection from "@/components/chat/formatSelection";

export default function MessageComposer({ onSend }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);

  const submit = async (e) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    setError("");
    try {
      await onSend(value);
      setText("");
    } catch {
      setError("Message couldn't be sent. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const apply = (f) => {
    const el = ref.current;
    const result = formatSelection(text, el.selectionStart, el.selectionEnd, f);
    setText(result.value);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.start, result.end);
    });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
  };

  return (
    <form
      onSubmit={submit}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
      className="shrink-0 bg-background px-3 py-2 shadow-[0_-4px_12px_hsl(var(--neu-dark))]"
      style={{ paddingLeft: "calc(var(--safe-left) + 0.75rem)", paddingRight: "calc(var(--safe-right) + 0.75rem)" }}
    >
      <div className="max-w-6xl mx-auto">
        {focused && <FormattingToolbar onApply={apply} />}
        {error && <p role="alert" className="pb-2 text-xs text-destructive">{error}</p>}
        <div className="flex items-end gap-2">
          <Textarea
            ref={ref}
            aria-label="Message"
            disabled={busy}
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            enterKeyHint="send"
            placeholder="Write a message…"
            className="min-h-[3.75rem] max-h-36 flex-1 min-w-0 resize-none rounded-2xl px-4 py-2.5 text-base"
          />
          <Button type="submit" size="icon" aria-label="Send" className="h-12 w-12 shrink-0 rounded-full" disabled={!text.trim() || busy}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}