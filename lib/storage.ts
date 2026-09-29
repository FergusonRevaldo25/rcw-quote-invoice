import { Quote } from "@/types/quote";

export interface BusinessDefaults {
  businessName: string;
  businessPhone: string;
}

export interface SavedClient {
  name: string;
  phone: string;
}

const DRAFT_KEY = "rcw_quote_draft";
const DEFAULTS_KEY = "rcw_business_defaults";
const CLIENTS_KEY = "rcw_clients";

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable (private browsing etc) — fail silently
  }
}

export function saveDraft(quote: Quote) {
  safeSet(DRAFT_KEY, JSON.stringify(quote));
}

export function loadDraft(): Quote | null {
  const raw = safeGet(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveBusinessDefaults(defaults: BusinessDefaults) {
  safeSet(DEFAULTS_KEY, JSON.stringify(defaults));
}

export function loadBusinessDefaults(): BusinessDefaults | null {
  const raw = safeGet(DEFAULTS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadClients(): SavedClient[] {
  const raw = safeGet(CLIENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveClient(client: SavedClient) {
  if (!client.name.trim()) return;
  const clients = loadClients();
  const exists = clients.some(
    (c) => c.name === client.name && c.phone === client.phone,
  );
  if (!exists) {
    clients.push(client);
    safeSet(CLIENTS_KEY, JSON.stringify(clients));
  }
}
const LOGO_KEY = "rcw_business_logo";

export function saveBusinessLogo(base64: string) {
  safeSet(LOGO_KEY, base64);
}

export function loadBusinessLogo(): string | null {
  return safeGet(LOGO_KEY);
}

export function clearBusinessLogo() {
  try {
    localStorage.removeItem(LOGO_KEY);
  } catch {
    // ignore
  }
}
