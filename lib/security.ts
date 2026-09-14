// Small input-hardening + rate-limiting helpers shared by the API routes.
// The site has no auth or database, so the goal here is: keep untrusted form
// input bounded and clean before it goes into an email, and blunt basic abuse
// (spamming the deli's inbox) with a best-effort per-IP limit.

import { NextRequest } from "next/server";

// All C0/C1 control chars including tab/newline/CR.
const ALL_CONTROL = /[\x00-\x1F\x7F]/g;
// Control chars except newline (\x0A) and CR (\x0D), which multiLine keeps.
const CONTROL_KEEP_NL = /[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g;

// Single-line field: strip control chars/newlines, collapse whitespace, cap length.
export function oneLine(v: unknown, max = 200): string {
  return String(v ?? "")
    .replace(ALL_CONTROL, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// Multi-line field (notes, address, details): keep newlines, strip other
// control chars, trim, cap length.
export function multiLine(v: unknown, max = 1500): string {
  return String(v ?? "")
    .replace(/\r\n/g, "\n")
    .replace(CONTROL_KEEP_NL, "")
    .trim()
    .slice(0, max);
}

// Conservative email check — enough to reject junk and header-injection attempts.
export function isEmail(v: string): boolean {
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(v) && !/[\r\n,]/.test(v);
}

// Best-effort in-memory rate limit. On serverless this is per-instance, so it
// is a mitigation, not a guarantee — a WAF / platform rate limit is the real
// defense — but it stops casual inbox spam from a single client.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function rateLimited(req: NextRequest): boolean {
  const ip = clientIp(req);
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    // opportunistic cleanup so the map can't grow unbounded
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
    }
    return false;
  }
  b.count += 1;
  return b.count > MAX_PER_WINDOW;
}
