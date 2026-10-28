import { NextRequest, NextResponse } from "next/server";

// Server-side proxy for address autocomplete. The browser calls this same-origin
// endpoint (our CSP only allows connect-src 'self'); we query Photon
// (photon.komoot.io), a free OpenStreetMap geocoder built for autocomplete — no
// API key. Suggestions are biased toward the deli. Not using the shared order
// rate-limiter here: autocomplete is debounced and must not consume an order's
// request budget.

const DELI = { lat: 44.9784, lng: -93.2718 };

type PhotonProps = {
  housenumber?: string;
  street?: string;
  name?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  postcode?: string;
  countrycode?: string;
};
type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: PhotonProps;
};
type PhotonResp = { features?: PhotonFeature[] };

function labelFor(p: PhotonProps): string {
  const line1 =
    [p.housenumber, p.street].filter(Boolean).join(" ") || p.name || "";
  const city = p.city || p.town || p.village || p.county || "";
  const region = [p.state, p.postcode].filter(Boolean).join(" ");
  const line2 = [city, region].filter(Boolean).join(", ");
  return [line1, line2].filter(Boolean).join(", ");
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 120);
  if (q.length < 4) return NextResponse.json({ ok: true, results: [] });

  try {
    const url =
      `https://photon.komoot.io/api/?limit=6&lang=en&lat=${DELI.lat}&lon=${DELI.lng}&q=` +
      encodeURIComponent(q);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TheBrothersDeli/1.0 (orders@thebrothersdeli.com)",
      },
    });
    const data = (await res.json()) as PhotonResp;
    const results = (data.features ?? [])
      .filter((f) => (f.properties?.countrycode ?? "US") === "US")
      .map((f) => ({
        label: labelFor(f.properties ?? {}),
        lat: f.geometry?.coordinates?.[1] ?? NaN,
        lng: f.geometry?.coordinates?.[0] ?? NaN,
      }))
      .filter(
        (s) => s.label && Number.isFinite(s.lat) && Number.isFinite(s.lng)
      );
    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json({ ok: true, results: [] });
  }
}
