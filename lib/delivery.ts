// Street-distance catering delivery fee using free OpenStreetMap services:
// Nominatim for geocoding + OSRM for the driving route. No API key, no billing.
// These are public, rate-limited, best-effort services — fine for a deli's
// catering volume. If a lookup fails, we fall back to the higher fee and flag
// it so the deli can verify when they confirm the (quote-based) order.

// The Brothers Deli — 50 South 6th Street, Minneapolis, MN 55402.
const DELI = { lat: 44.9784, lng: -93.2718 };
const MILE_METERS = 1609.344;
const UNDER_MILE_FEE = 5; // within 1 mile of the deli
const DEFAULT_OVER_MILE_FEE = 25; // farther than 1 mile (online orders; catering passes 30)

export type DeliveryQuote = {
  fee: number;
  miles?: number;
  durationMin?: number; // estimated driving time, minutes (for the delivery ETA)
  calculated: boolean; // false = couldn't auto-calc, fee is an estimate to confirm
  note?: string;
};

export async function deliveryFee(
  address: string,
  coords?: { lat: number; lng: number },
  overMileFee: number = DEFAULT_OVER_MILE_FEE
): Promise<DeliveryQuote> {
  const q = (address || "").trim();
  const haveCoords =
    !!coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng);
  if (!q && !haveCoords)
    return { fee: overMileFee, calculated: false, note: "no address" };

  try {
    let lat: number;
    let lng: number;
    if (haveCoords) {
      lat = coords!.lat;
      lng = coords!.lng;
    } else {
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
        return { fee: overMileFee, calculated: false, note: "address not found" };
      }
      lat = parseFloat(geo[0].lat);
      lng = parseFloat(geo[0].lon);
    }

    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${DELI.lng},${DELI.lat};${lng},${lat}?overview=false`;
    const rRes = await fetch(osrmUrl);
    const r = (await rRes.json()) as {
      routes?: Array<{ distance?: number; duration?: number }>;
    };
    const meters = r?.routes?.[0]?.distance;
    const seconds = r?.routes?.[0]?.duration;
    if (typeof meters !== "number") {
      return { fee: overMileFee, calculated: false, note: "route unavailable" };
    }
    const miles = Math.round((meters / MILE_METERS) * 100) / 100;
    const fee = miles <= 1 ? UNDER_MILE_FEE : overMileFee;
    const durationMin =
      typeof seconds === "number" ? Math.round(seconds / 60) : undefined;
    return { fee, miles, durationMin, calculated: true };
  } catch {
    return { fee: overMileFee, calculated: false, note: "lookup error" };
  }
}
