import dotenv from "dotenv";

dotenv.config({ quiet: true });

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const integer = (name: string, fallback: number, min: number): number => {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min) {
    throw new Error(`${name} must be an integer of at least ${min}`);
  }
  return value;
};

export const PORT = Number(process.env.PORT) || 3000;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const DATABASE_URL = required("DATABASE_URL");
export const API_KEY = required("API_KEY");
export const CORS_ORIGINS = (
  process.env.CORS_ORIGINS || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Number of reverse proxies in front of the API (0 when it faces clients
// directly). It decides which address counts as the client's, so the rate
// limits see real visitors and not the proxy.
export const TRUST_PROXY = integer("TRUST_PROXY", 0, 0);

// Rate limits per client address. The window is shared by the three limits.
export const RATE_LIMIT_WINDOW_MS = integer("RATE_LIMIT_WINDOW_MS", 60_000, 1);
// Every request to the API.
export const RATE_LIMIT_MAX = integer("RATE_LIMIT_MAX", 120, 1);
// POST, PATCH and DELETE requests.
export const RATE_LIMIT_WRITE_MAX = integer("RATE_LIMIT_WRITE_MAX", 20, 1);
// Write requests answered with 401 (a wrong or missing API key).
export const RATE_LIMIT_AUTH_FAIL_MAX = integer(
  "RATE_LIMIT_AUTH_FAIL_MAX",
  10,
  1,
);
