import { NextResponse } from "next/server";

// TEMPORARY diagnostic — reports only whether the North vars are present (no
// secret values). Remove before merging to production.
export async function GET() {
  return NextResponse.json({
    vercelEnv: process.env.VERCEL_ENV ?? null,
    northEnv: process.env.NORTH_ENV ?? null,
    hasApiKey: Boolean(process.env.NORTH_API_KEY),
    hasCheckoutId: Boolean(process.env.NORTH_CHECKOUT_ID),
    hasProfileId: Boolean(process.env.NORTH_PROFILE_ID),
    checkoutIdTail: (process.env.NORTH_CHECKOUT_ID || "").slice(-6) || null,
    profileIdTail: (process.env.NORTH_PROFILE_ID || "").slice(-6) || null,
  });
}
