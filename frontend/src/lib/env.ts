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

export type AppAuthProvider = "supabase" | "portal";

export function getAuthProvider(): AppAuthProvider {
  return import.meta.env.VITE_AUTH_PROVIDER === "portal" ? "portal" : "supabase";
}

export function isPortalAuthProvider() {
  return getAuthProvider() === "portal";
}

export function getPortalOrigin() {
  return (import.meta.env.VITE_PORTAL_ORIGIN || "https://portal.builtbysalih.com").replace(/\/+$/, "");
}

export function getPortalApiBaseUrl() {
  return (import.meta.env.VITE_PORTAL_API_BASE_URL || "https://api.builtbysalih.com").replace(/\/+$/, "");
}

export function getAppOrigin() {
  if (import.meta.env.VITE_APP_ORIGIN) {
    return import.meta.env.VITE_APP_ORIGIN.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "https://clubs.builtbysalih.com";
}

export function getPortalAuthUrl(
  path: "sign-in" | "sign-up" | "forgot-password" | "sign-out",
  callbackUrl?: string | null
) {
  const portalOrigin = getPortalOrigin();
  const nextCallback = callbackUrl === undefined ? getAppOrigin() : callbackUrl;

  if (!nextCallback) {
    return `${portalOrigin}/${path}`;
  }

  const callback = encodeURIComponent(nextCallback);

  if (path === "sign-out") {
    return `${portalOrigin}/sign-out?callbackURL=${callback}`;
  }

  return `${portalOrigin}/${path}?callbackURL=${callback}`;
}

export type AuthMode = "microsoft" | "password" | "mixed";

export function getAuthMode(): AuthMode {
  const configuredMode = import.meta.env.VITE_AUTH_MODE;

  if (configuredMode === "microsoft" || configuredMode === "password" || configuredMode === "mixed") {
    return configuredMode;
  }

  return "password";
}

export function isMicrosoftAuthEnabled() {
  return getAuthMode() === "microsoft" || getAuthMode() === "mixed";
}

export function isPasswordAuthEnabled() {
  return getAuthMode() === "password" || getAuthMode() === "mixed";
}

export function getMicrosoftPasswordHelpUrl() {
  return import.meta.env.VITE_MICROSOFT_PASSWORD_HELP_URL || "https://passwordreset.microsoftonline.com/";
}
