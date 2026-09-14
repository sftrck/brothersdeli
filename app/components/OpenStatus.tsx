"use client";

import { useEffect, useState } from "react";

// Hours in America/Chicago, as minutes from midnight.
// Mon–Thu 7:30–1:30, Fri 10:30–1:00, weekends closed.
const SCHEDULE: Record<string, [number, number] | undefined> = {
  Mon: [450, 810],
  Tue: [450, 810],
  Wed: [450, 810],
  Thu: [450, 810],
  Fri: [630, 780],
  Sat: undefined,
  Sun: undefined,
};
const ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmt(mins: number): string {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
}

function computeLabel(): { open: boolean; text: string } | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    const wd = get("weekday");
    const now = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);
    const today = SCHEDULE[wd];
    if (today && now >= today[0] && now < today[1]) {
      return { open: true, text: `Open now · til ${fmt(today[1])}` };
    }
    // find the next open day/time
    const idx = ORDER.indexOf(wd);
    for (let i = 0; i < 7; i++) {
      const d = ORDER[(idx + i) % 7];
      const win = SCHEDULE[d];
      if (!win) continue;
      if (i === 0 && now < win[0]) {
        return { open: false, text: `Opens today ${fmt(win[0])}` };
      }
      if (i > 0) {
        const dayLabel = i === 1 ? "tomorrow" : d;
        return { open: false, text: `Opens ${dayLabel} ${fmt(win[0])}` };
      }
    }
    return { open: false, text: "Closed" };
  } catch {
    return null;
  }
}

export default function OpenStatus() {
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(
    null
  );

  useEffect(() => {
    setStatus(computeLabel());
    const t = setInterval(() => setStatus(computeLabel()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Neutral fallback (server + first paint) avoids a hydration mismatch.
  if (!status) {
    return (
      <div className="hours">
        <span className="dot" /> Mon–Fri · breakfast &amp; lunch
      </div>
    );
  }

  return (
    <div className="hours">
      <span className={`dot${status.open ? "" : " closed"}`} /> {status.text} ·
      Mon–Fri
    </div>
  );
}
