/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ALLOWED_EMAIL_DOMAINS?: string;
  readonly VITE_AUTH_PROVIDER?: "supabase" | "portal";
  readonly VITE_PORTAL_ORIGIN?: string;
  readonly VITE_PORTAL_API_BASE_URL?: string;
  readonly VITE_APP_ORIGIN?: string;
  readonly VITE_AUTH_MODE?: "microsoft" | "password" | "mixed";
  readonly VITE_MICROSOFT_PASSWORD_HELP_URL?: string;
  readonly VITE_WEB_PUSH_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
