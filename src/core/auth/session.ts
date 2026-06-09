/**
 * Self-contained authentication for the human-facing app (login + signed-cookie sessions).
 *
 * No database: sessions are stateless HMAC-SHA256-signed cookies. Uses Web Crypto so the
 * SAME code runs in both the Edge middleware and Node route handlers. Credentials are
 * SHA-256 hashes configured via env — fits the sovereign/local deployment model.
 *
 * The public /v1 API uses a separate Bearer-key guard (lib/openai.ts) — humans log in,
 * machines use API keys.
 */

const enc = new TextEncoder();

export const AUTH_SECRET = process.env.ZAKI_AUTH_SECRET || "dev-insecure-secret-change-before-publishing";
export const SESSION_COOKIE = "zaki_session";
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// `ZAKI_AUTH_USERS` = "user:sha256hex,user2:sha256hex". Default: admin / zaki-admin-2026.
const DEFAULT_USERS = "admin:8625f61c3665e92f726e8a8315fef107d8865124b1a97a068dd3d74dc27106bc";
const USERS_RAW = process.env.ZAKI_AUTH_USERS || DEFAULT_USERS;

function parseUsers(): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of USERS_RAW.split(",")) {
    const i = pair.indexOf(":");
    if (i > 0) map.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim().toLowerCase());
  }
  return map;
}

// ── base64url <-> bytes (works in Edge + Node) ──
function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(s: string): Uint8Array {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(AUTH_SECRET), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
}

async function sign(data: string): Promise<string> {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bytesToB64url(new Uint8Array(sig));
}

export async function sha256hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Verify username/password against the configured SHA-256 hashes. */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const users = parseUsers();
  const stored = users.get(username);
  if (!stored) return false;
  const given = await sha256hex(password);
  return timingSafeEqual(given, stored);
}

/** Create a signed session token: base64url(payload).signature */
export async function createSession(username: string): Promise<string> {
  const payload = bytesToB64url(
    enc.encode(JSON.stringify({ u: username, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS })),
  );
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

/** Verify a session token; returns the username or null. */
export async function verifySession(token: string | undefined | null): Promise<{ user: string } | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await sign(payload);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload))) as { u: string; exp: number };
    if (!data.u || typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { user: data.u };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSeconds = TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
