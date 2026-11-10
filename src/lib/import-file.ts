import mammoth from "mammoth";

const ALLOWED = new Set([".txt", ".md", ".docx"]);
const MAX_BYTES = 2 * 1024 * 1024;

export function allowedExtensions(): string[] {
  return [...ALLOWED];
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

export async function fileToHtml(file: File): Promise<{ title: string; html: string }> {
  if (file.size > MAX_BYTES) {
    throw new Error("File is larger than 2 MB.");
  }
  const ext = extensionOf(file.name);
  if (!ALLOWED.has(ext)) {
    throw new Error("Supported uploads: .txt, .md, .docx");
  }
  const title = file.name.replace(/\.[^.]+$/, "") || "Imported document";
  if (ext === ".docx") {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.convertToHtml({ buffer });
    const html = result.value.trim() || "<p></p>";
    return { title, html };
  }
  const text = await file.text();
  const html = textToHtml(text);
  return { title, html };
}

function textToHtml(text: string): string {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const blocks = escaped.split(/\n{2,}/).map((block) => {
    const lines = block.split("\n").map((line) => line.trimEnd());
    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      const items = lines.map((line) => `<li>${line.replace(/^[-*]\s+/, "")}</li>`).join("");
      return `<ul>${items}</ul>`;
    }
    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      const items = lines.map((line) => `<li>${line.replace(/^\d+\.\s+/, "")}</li>`).join("");
      return `<ol>${items}</ol>`;
    }
    if (lines.length === 1 && lines[0].startsWith("# ")) {
      return `<h1>${lines[0].slice(2)}</h1>`;
    }
    if (lines.length === 1 && lines[0].startsWith("## ")) {
      return `<h2>${lines[0].slice(3)}</h2>`;
    }
    return `<p>${lines.join("<br>")}</p>`;
  });
  return blocks.join("") || "<p></p>";
}
