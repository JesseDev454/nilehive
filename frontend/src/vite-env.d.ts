/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ONECLUB_MODE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
