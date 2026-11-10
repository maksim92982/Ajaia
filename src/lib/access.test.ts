import assert from "node:assert/strict";
import test from "node:test";
import { canRead, canShare, canWrite, roleFor } from "./access";

test("owner can read, write, and share", () => {
  const role = roleFor("u1", "u1", []);
  assert.equal(role, "owner");
  assert.equal(canRead(role), true);
  assert.equal(canWrite(role), true);
  assert.equal(canShare(role), true);
});

test("shared user can edit but not share", () => {
  const role = roleFor("u1", "u2", ["u2"]);
  assert.equal(role, "shared");
  assert.equal(canRead(role), true);
  assert.equal(canWrite(role), true);
  assert.equal(canShare(role), false);
});

test("stranger has no access", () => {
  const role = roleFor("u1", "u3", ["u2"]);
  assert.equal(role, "none");
  assert.equal(canRead(role), false);
  assert.equal(canWrite(role), false);
  assert.equal(canShare(role), false);
});
