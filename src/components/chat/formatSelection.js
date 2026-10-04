export default function formatSelection(text, start, end, format) {
  if (format.list) {
    const from = start > 0 ? text.lastIndexOf("\n", start - 1) + 1 : 0;
    const next = text.indexOf("\n", Math.max(start, end - 1));
    const to = next < 0 ? text.length : next;
    const lines = text.slice(from, to).split("\n");
    const remove = lines.every((line) => /^- /.test(line));
    const block = lines.map((line) => remove ? line.replace(/^- /, "") : /^- /.test(line) ? line : `- ${line}`).join("\n");
    const prefix = from > 0 && text.slice(0, from).trim() && !text.slice(0, from).endsWith("\n\n") ? "\n" : "";
    const suffix = to < text.length && !text.slice(to).startsWith("\n\n") ? "\n" : "";
    const value = text.slice(0, from) + prefix + block + suffix + text.slice(to);
    const cursor = from + prefix.length + block.length;
    return { value, start: cursor, end: cursor };
  }
  const wrap = format.wrap;
  const selection = text.slice(start, end);
  if (selection && text.slice(Math.max(0, start - wrap.length), start) === wrap && text.slice(end, end + wrap.length) === wrap) {
    return { value: text.slice(0, start - wrap.length) + selection + text.slice(end + wrap.length), start: start - wrap.length, end: end - wrap.length };
  }
  const value = text.slice(0, start) + wrap + selection + wrap + text.slice(end);
  return { value, start: start + wrap.length, end: end + wrap.length };
}