import { createRoot } from "react-dom/client";
import { preconnect } from "react-dom";
import App from "./App.tsx";
import "./index.css";
import { getApiBaseUrl, getSupabaseUrl } from "@/lib/env";

// Warm up the connection to our API and Supabase before the first request
// (auth/profile fetch) fires, so the DNS/TCP/TLS handshake isn't on the
// critical path of the initial load.
[getApiBaseUrl, getSupabaseUrl].forEach((getUrl) => {
  try {
    preconnect(getUrl());
  } catch {
    // Env var not configured in this environment; nothing to preconnect to.
  }
});

createRoot(document.getElementById("root")!).render(<App />);
