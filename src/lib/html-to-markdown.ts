function decode(text: string): string {
  return text
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"');
}

function inline(html: string): string {
  let text = html;
  text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  text = text.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
  text = text.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, "$1");
  text = text.replace(/<br\s*\/?>/gi, "  \n");
  text = text.replace(/<[^>]+>/g, "");
  return decode(text).trim();
}

export function htmlToMarkdown(html: string): string {
  const blocks: string[] = [];
  const source = html.replace(/\n+/g, "");
  const re = /<(h1|h2|p|ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    const tag = match[1].toLowerCase();
    const inner = match[2];
    if (tag === "h1") blocks.push(`# ${inline(inner)}`);
    else if (tag === "h2") blocks.push(`## ${inline(inner)}`);
    else if (tag === "ul") {
      const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => `- ${inline(item[1])}`);
      if (items.length) blocks.push(items.join("\n"));
    } else if (tag === "ol") {
      const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(
        (item, index) => `${index + 1}. ${inline(item[1])}`,
      );
      if (items.length) blocks.push(items.join("\n"));
    } else {
      const paragraph = inline(inner);
      if (paragraph) blocks.push(paragraph);
    }
  }
  return `${blocks.join("\n\n").trim()}\n`;
}

export function markdownFilename(title: string): string {
  const stem = title.replace(/[<>:"/\\|?*]+/g, " ").replace(/\s+/g, " ").trim() || "Untitled";
  return `${stem}.md`;
}
