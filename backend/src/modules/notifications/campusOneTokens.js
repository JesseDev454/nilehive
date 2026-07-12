const crypto = require("crypto");
const { getEnv } = require("../../config/env");

function getEncryptionKey(env = getEnv()) {
  if (!env.CAMPUS_ONE_TOKEN_ENCRYPTION_KEY) return null;
  return crypto.createHash("sha256").update(env.CAMPUS_ONE_TOKEN_ENCRYPTION_KEY).digest();
}

function encryptToken(value, env = getEnv()) {
  if (!value) return null;
  const key = getEncryptionKey(env);
  if (!key) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ciphertext.toString("base64url")].join(".");
}

function decryptToken(value, env = getEnv()) {
  if (!value) return null;
  const key = getEncryptionKey(env);
  if (!key) return null;
  const [version, iv, tag, ciphertext] = String(value).split(".");
  if (version !== "v1" || !iv || !tag || !ciphertext) throw new Error("Invalid encrypted CampusOne token");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}

async function saveCampusOneAuthorization({ database, profileId, tokens, env = getEnv() }) {
  if (!database?.upsertCampusOneAuthorization || !profileId || !tokens?.access_token || !getEncryptionKey(env)) return null;
  const scopes = String(tokens.scope || env.CAMPUS_ONE_SCOPES || "").split(/\s+/).filter(Boolean);
  return database.upsertCampusOneAuthorization({
    profile_id: profileId,
    access_token_ciphertext: encryptToken(tokens.access_token, env),
    refresh_token_ciphertext: encryptToken(tokens.refresh_token, env),
    scopes,
    access_token_expires_at: tokens.expires_in ? new Date(Date.now() + Number(tokens.expires_in) * 1000).toISOString() : null,
    disconnected_at: null,
    updated_at: new Date().toISOString()
  });
}

module.exports = { decryptToken, encryptToken, getEncryptionKey, saveCampusOneAuthorization };
