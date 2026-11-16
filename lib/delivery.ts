// Delivery fee + ETA. The fee is a FLAT $25 for every delivery order (regular
// menu or catering), regardless of distance. We still look up the driving
// route — via free OpenStreetMap services (Nominatim for geocoding + OSRM for
// the route) — only to estimate the delivery time. No API key, no billing.
// These are public, rate-limited, best-effort services; if a lookup fails we
// still charge the flat fee and just omit the distance/ETA.

// The Brothers Deli — 50 South 6th Street, Minneapolis, MN 55402.
const DELI = { lat: 44.9784, lng: -93.2718 };
const MILE_METERS = 1609.344;
const FLAT_DELIVERY_FEE = 25; // flat fee for any delivery, any distance

export type DeliveryQuote = {
  fee: number;
  miles?: number;
  durationMin?: number; // estimated driving time, minutes (for the delivery ETA)
  calculated: boolean; // false = couldn't auto-calc, fee is an estimate to confirm
  note?: string;
};

export async function deliveryFee(
  address: string,
  coords?: { lat: number; lng: number }
): Promise<DeliveryQuote> {
  const q = (address || "").trim();
  const haveCoords =
    !!coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng);
  // Flat fee always; without an address we just can't add an ETA.
  if (!q && !haveCoords)
    return { fee: FLAT_DELIVERY_FEE, calculated: true, note: "no address" };

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
        return { fee: FLAT_DELIVERY_FEE, calculated: true, note: "address not found" };
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
      return { fee: FLAT_DELIVERY_FEE, calculated: true, note: "route unavailable" };
    }
    const miles = Math.round((meters / MILE_METERS) * 100) / 100;
    const durationMin =
      typeof seconds === "number" ? Math.round(seconds / 60) : undefined;
    return { fee: FLAT_DELIVERY_FEE, miles, durationMin, calculated: true };
  } catch {
    return { fee: FLAT_DELIVERY_FEE, calculated: true, note: "lookup error" };
  }
}
