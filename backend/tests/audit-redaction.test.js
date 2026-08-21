const test = require("node:test");
const assert = require("node:assert/strict");
const { redactAuditMetadata, isSensitiveKey } = require("../src/shared/auditRedaction");

test("audit redaction matches sensitive keys case-insensitively", () => {
  assert.equal(isSensitiveKey("access_token"), true);
  assert.equal(isSensitiveKey("Authorization"), true);
  assert.equal(isSensitiveKey("CSRF"), true);
  assert.equal(isSensitiveKey("signed_url"), true);
  assert.equal(isSensitiveKey("clientSecret"), true);
  assert.equal(isSensitiveKey("decision"), false);
  assert.equal(isSensitiveKey("status"), false);
});

test("audit redaction recursively redacts nested secrets without exposing values", () => {
  const redacted = redactAuditMetadata({
    decision: "approve",
    nested: {
      Authorization: "Bearer should-not-appear",
      cookies: ["session=abc"],
      deeper: {
        refresh_token: "refresh-secret",
        ok: true
      }
    },
    list: [
      { access_token: "token-secret", stage: "admin" },
      "plain"
    ]
  });

  assert.equal(redacted.decision, "approve");
  assert.deepEqual(redacted.nested.Authorization, { redacted: true });
  assert.deepEqual(redacted.nested.cookies, { redacted: true });
  assert.deepEqual(redacted.nested.deeper.refresh_token, { redacted: true });
  assert.equal(redacted.nested.deeper.ok, true);
  assert.deepEqual(redacted.list[0].access_token, { redacted: true });
  assert.equal(redacted.list[0].stage, "admin");
  assert.equal(redacted.list[1], "plain");
  assert.equal(JSON.stringify(redacted).includes("should-not-appear"), false);
  assert.equal(JSON.stringify(redacted).includes("token-secret"), false);
  assert.equal(JSON.stringify(redacted).includes("refresh-secret"), false);
});

test("audit redaction handles malformed metadata safely", () => {
  assert.deepEqual(redactAuditMetadata(null), {});
  assert.deepEqual(redactAuditMetadata(12), {});
  assert.deepEqual(redactAuditMetadata("not-json"), {});
  assert.equal(redactAuditMetadata("{ \"status\": \"paid\" }").status, "paid");
});
