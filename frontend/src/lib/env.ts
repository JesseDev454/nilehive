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

