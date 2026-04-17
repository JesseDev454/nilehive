function readEnv(name: keyof ImportMetaEnv) {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getApiBaseUrl() {
  return readEnv("VITE_API_BASE_URL").replace(/\/+$/, "");
}

export function getSupabaseUrl() {
  return readEnv("VITE_SUPABASE_URL");
}

export function getSupabaseAnonKey() {
  return readEnv("VITE_SUPABASE_ANON_KEY");
}

function parseDomains(value: string) {
  return value
    .split(",")
    .map((domain) => domain.trim().replace(/^@/, "").toLowerCase())
    .filter(Boolean);
}

export function getAllowedEmailDomains() {
  const configuredDomains = import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS;

  if (configuredDomains) {
    return parseDomains(configuredDomains);
  }

  return import.meta.env.PROD ? ["nileuniversity.edu.ng"] : ["nileuniversity.edu.ng", "nilehive.test"];
}

export function isAllowedEmailDomain(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const atIndex = normalizedEmail.lastIndexOf("@");
  const domain = atIndex === -1 ? "" : normalizedEmail.slice(atIndex + 1);

  return getAllowedEmailDomains().includes(domain);
}

export function getAllowedEmailDomainLabel() {
  return getAllowedEmailDomains()
    .map((domain) => `@${domain}`)
    .join(", ");
}
