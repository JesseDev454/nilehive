const REDACTED = { redacted: true };
const MAX_DEPTH = 8;
const MAX_NODES = 200;
const MAX_STRING_LENGTH = 400;
const MAX_ARRAY_LENGTH = 50;
const MAX_OBJECT_KEYS = 50;

const SENSITIVE_FRAGMENTS = [
  "password",
  "secret",
  "token",
  "authorization",
  "cookie",
  "session",
  "csrf",
  "codeverifier",
  "authorizationcode",
  "clientsecret",
  "servicerole",
  "accesstoken",
  "refreshtoken",
  "idtoken",
  "signedurl",
  "proofurl",
  "storagepath"
];

function compactKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[-_\s]/g, "");
}

function isSensitiveKey(key) {
  const compact = compactKey(key);
  if (!compact) {
    return false;
  }

  return SENSITIVE_FRAGMENTS.some((fragment) => compact === fragment || compact.includes(fragment));
}

function truncateString(value) {
  if (typeof value !== "string") {
    return value;
  }

  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_STRING_LENGTH)}…`;
}

function redactValue(value, depth, state) {
  if (state.nodes >= MAX_NODES || depth > MAX_DEPTH) {
    return { truncated: true };
  }

  state.nodes += 1;

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return truncateString(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return Number.isFinite(value) || typeof value === "boolean" ? value : null;
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_LENGTH).map((item) => redactValue(item, depth + 1, state));
  }

  if (typeof value !== "object") {
    return null;
  }

  const entries = Object.entries(value).slice(0, MAX_OBJECT_KEYS);
  const result = {};

  for (const [key, nested] of entries) {
    result[key] = isSensitiveKey(key) ? REDACTED : redactValue(nested, depth + 1, state);
  }

  return result;
}

function redactAuditMetadata(metadata) {
  if (metadata === null || metadata === undefined) {
    return {};
  }

  if (typeof metadata === "string") {
    try {
      return redactValue(JSON.parse(metadata), 0, { nodes: 0 });
    } catch {
      return {};
    }
  }

  if (typeof metadata !== "object") {
    return {};
  }

  return redactValue(metadata, 0, { nodes: 0 }) || {};
}

module.exports = {
  REDACTED,
  isSensitiveKey,
  redactAuditMetadata
};
