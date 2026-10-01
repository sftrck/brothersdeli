// Street-distance catering delivery fee using free OpenStreetMap services:
// Nominatim for geocoding + OSRM for the driving route. No API key, no billing.
// These are public, rate-limited, best-effort services — fine for a deli's
// catering volume. If a lookup fails, we fall back to the higher fee and flag
// it so the deli can verify when they confirm the (quote-based) order.

// The Brothers Deli — 50 South 6th Street, Minneapolis, MN 55402.
const DELI = { lat: 44.9784, lng: -93.2718 };
const MILE_METERS = 1609.344;
const UNDER_MILE_FEE = 5;
const OVER_MILE_FEE = 30;

export type DeliveryQuote = {
  fee: number;
  miles?: number;
  calculated: boolean; // false = couldn't auto-calc, fee is an estimate to confirm
  note?: string;
};

export async function deliveryFee(address: string): Promise<DeliveryQuote> {
  const q = (address || "").trim();
  if (!q) return { fee: OVER_MILE_FEE, calculated: false, note: "no address" };

  try {
    const geoUrl =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=" +
      encodeURIComponent(q);
    const geoRes = await fetch(geoUrl, {
      headers: {
        "User-Agent": "TheBrothersDeli/1.0 (orders@thebrothersdeli.com)",
      },
    });
    const geo = (await geoRes.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(geo) || geo.length === 0) {
      return { fee: OVER_MILE_FEE, calculated: false, note: "address not found" };
    }
    const lat = parseFloat(geo[0].lat);
    const lng = parseFloat(geo[0].lon);

    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${DELI.lng},${DELI.lat};${lng},${lat}?overview=false`;
    const rRes = await fetch(osrmUrl);
    const r = (await rRes.json()) as {
      routes?: Array<{ distance?: number }>;
    };
    const meters = r?.routes?.[0]?.distance;
    if (typeof meters !== "number") {
      return { fee: OVER_MILE_FEE, calculated: false, note: "route unavailable" };
    }
    const miles = Math.round((meters / MILE_METERS) * 100) / 100;
    const fee = miles <= 1 ? UNDER_MILE_FEE : OVER_MILE_FEE;
    return { fee, miles, calculated: true };
  } catch {
    return { fee: OVER_MILE_FEE, calculated: false, note: "lookup error" };
  }
}
