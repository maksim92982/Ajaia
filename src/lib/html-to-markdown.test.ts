import assert from "node:assert/strict";
import test from "node:test";
import { htmlToMarkdown, markdownFilename } from "./html-to-markdown";

test("converts headings, marks, and lists", () => {
  const html =
    "<h1>Notes</h1><p>Hello <strong>world</strong> and <em>more</em></p><ul><li>alpha</li><li>beta</li></ul><ol><li>one</li><li>two</li></ol>";
  const md = htmlToMarkdown(html);
  assert.match(md, /^# Notes/m);
  assert.match(md, /\*\*world\*\*/);
  assert.match(md, /\*more\*/);
  assert.match(md, /^- alpha$/m);
  assert.match(md, /^1\. one$/m);
});

test("builds a safe download name from the title", () => {
  assert.equal(markdownFilename("QA note"), "QA note.md");
  assert.equal(markdownFilename('a/b:c*.txt'), "a b c .txt.md");
  assert.equal(markdownFilename("   "), "Untitled.md");
});
