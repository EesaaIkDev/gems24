import React, { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, Send } from "lucide-react";

const FORMATS = [
  { icon: Bold, label: "Bold", wrap: "**" },
  { icon: Italic, label: "Italic", wrap: "_" },
  { icon: List, label: "List", prefix: "- " },
];

export default function MessageComposer({ onSend }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  const submit = async (e) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    setText("");
    await onSend(value);
    setBusy(false);
  };

  const apply = (f) => {
    const el = ref.current;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = text.slice(s, e);
    const insert = f.wrap ? `${f.wrap}${sel}${f.wrap}` : `${f.prefix}${sel}`;
    setText(text.slice(0, s) + insert + text.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      const pos = f.wrap && !sel ? s + f.wrap.length : s + insert.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
  };

  return (
    <form
      onSubmit={submit}
      className="shrink-0 bg-background px-3 py-2 shadow-[0_-4px_12px_hsl(var(--neu-dark))]"
      style={{ paddingLeft: "calc(var(--safe-left) + 0.75rem)", paddingRight: "calc(var(--safe-right) + 0.75rem)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-1 pb-1.5">
          {FORMATS.map((f) => (
            <button key={f.label} type="button" aria-label={f.label} onMouseDown={(e) => e.preventDefault()} onClick={() => apply(f)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary">
              <f.icon className="w-4 h-4" />
            </button>
          ))}
          <span className="ml-auto hidden sm:block text-[0.6875rem] text-muted-foreground">Enter to send · Shift + Enter for new line</span>
        </div>
        <div className="flex items-end gap-2">
          <Textarea
            ref={ref}
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