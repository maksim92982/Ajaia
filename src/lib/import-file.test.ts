import assert from "node:assert/strict";
import test from "node:test";
import { fileToHtml } from "./import-file";

test("turns markdown-ish text into headings and lists", async () => {
  const file = new File(
    ["# Notes\n\n- alpha\n- beta\n\n1. first\n2. second\n\nHello\nworld"],
    "standup.md",
    { type: "text/markdown" },
  );
  const result = await fileToHtml(file);
  assert.equal(result.title, "standup");
  assert.match(result.html, /<h1>Notes<\/h1>/);
  assert.match(result.html, /<ul><li>alpha<\/li><li>beta<\/li><\/ul>/);
  assert.match(result.html, /<ol><li>first<\/li><li>second<\/li><\/ol>/);
  assert.match(result.html, /Hello<br>world/);
});

test("rejects unsupported types and oversized files", async () => {
  await assert.rejects(() => fileToHtml(new File(["x"], "photo.png")), /Supported uploads/);
  const huge = new File(["x"], "notes.txt");
  Object.defineProperty(huge, "size", { value: 3 * 1024 * 1024 });
  await assert.rejects(() => fileToHtml(huge), /2 MB/);
});
