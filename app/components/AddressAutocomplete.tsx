"use client";

// Delivery address field with autocomplete + validation. Suggestions come from
// our own /api/geocode proxy (the site CSP only allows connect-src 'self'),
// which queries a free OpenStreetMap geocoder. The customer must pick a
// suggestion, which gives us exact coordinates so the delivery fee + ETA are
// calculated from a real, resolvable address rather than free text.

import { useEffect, useRef, useState } from "react";

export type PickedAddress = { label: string; lat: number; lng: number };

type Sugg = { label: string; lat: number; lng: number };
type GeocodeResp = { ok?: boolean; results?: Sugg[] };

export default function AddressAutocomplete({
  value,
  onType,
  onPick,
  placeholder,
}: {
  value: string;
  onType: (text: string) => void;
  onPick: (a: PickedAddress) => void;
  placeholder?: string;
}) {
  const [sugg, setSugg] = useState<Sugg[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const skipNext = useRef(false); // don't re-query right after a pick

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 4) {
      setSugg([]);
      setOpen(false);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/geocode?q=" + encodeURIComponent(q), {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as GeocodeResp;
        const items = (data.results ?? []).filter(
          (s) => s.label && Number.isFinite(s.lat) && Number.isFinite(s.lng)
        );
        setSugg(items);
        setOpen(items.length > 0);
        setActive(-1);
      } catch {
        /* abort or network error — leave suggestions as-is */
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(s: Sugg) {
    skipNext.current = true;
    onPick(s);
    setOpen(false);
    setSugg([]);
  }

  return (
    <div className="addr-ac" ref={boxRef}>
      <input
        value={value}
        onChange={(e) => onType(e.target.value)}
        onFocus={() => sugg.length > 0 && setOpen(true)}
        onKeyDown={(e) => {
          if (!open || sugg.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, sugg.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            pick(sugg[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder || "Start typing your address…"}
        autoComplete="off"
      />
      {open && (
        <ul className="addr-list">
          {sugg.map((s, i) => (
            <li
              key={`${s.label}-${i}`}
              className={i === active ? "on" : ""}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
