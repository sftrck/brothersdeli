# The Brothers Deli

The Brothers Deli website — a self-owned build (off Wix), deployed via GitHub → Vercel.
Preserves the approved look and feel. Two order funnels (online ordering + catering),
order emails to the deli, and a payment seam for Payanywhere.

70+ year family deli on the downtown Minneapolis skyway. 50 South Sixth Street,
Skyway Level Suite #220, Minneapolis MN 55402 · (612) 341-8007 · thedeli@thebrothersdeli.com

## Stack

- **Next.js 15** (App Router, TypeScript) — deploy target **Vercel**
- Plain CSS (`app/globals.css`) — the exact approved design tokens/layout, no framework
- **Resend** for order/inquiry emails (serverless route)
- Payment handoff isolated in `lib/payment.ts` (Payanywhere hosted-payment seam)

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

The site runs with **no environment variables**: orders and catering inquiries are
logged to the server console instead of emailed, and checkout is "pay at pickup."
Add env vars (below) to turn on real emails and, later, online prepayment.

## Structure

```
app/
  page.tsx              Homepage (approved single-scroll design)
  order/page.tsx        Online ordering funnel — menu + cart + checkout
  catering/page.tsx     Catering funnel — offerings + quote request form
  api/order/route.ts    Receives an order, re-prices server-side, emails the deli
  api/catering/route.ts Receives a catering inquiry, emails the deli
  components/           Shared SiteHeader / SiteFooter (every page is branded)
lib/
  menu.ts               Full menu (168 items) with live prices — single source of truth
  email.ts              Resend wrapper (logs if RESEND_API_KEY unset)
  payment.ts            Payanywhere seam (pay-at-pickup until credentials added)
public/images/          Approved photos (extracted from the approved design)
public/catering-menu.pdf
```

## What the owner needs to provide

Everything below is tied to the deli's own accounts, so it can't be done from the code side.
The site is fully usable before any of it — this just turns features on.

1. **Order emails (Resend).** Create a resend.com account, add `thebrothersdeli.com`,
   and add the DNS records Resend generates. Put `RESEND_API_KEY` (and the
   `ORDER_EMAIL_*` values) in Vercel. Orders and catering requests then email the deli.

2. **Online prepayment (Payanywhere / North).** Payanywhere is mainly an in-person POS;
   online payment uses its **hosted payment page**. Enable the online gateway on the
   deli's Payanywhere/North account and provide the `PAYANYWHERE_*` credentials.
   Until then, customers order ahead and **pay at the POS on pickup** (normal for a
   deli). Wiring lives behind `lib/payment.ts` — a drop-in once credentials exist.

3. **Vercel + domain.** Connect this repo to Vercel and point `thebrothersdeli.com`
   at it when ready to cut over from Wix.

## Notes

- Menu prices in `lib/menu.ts` are the current live ("old site") prices.
- Order totals are always re-priced on the server from `lib/menu.ts` — client prices
  are never trusted.
- Pickup only (~15 min). Catering: 24 hours' notice, 8-person minimum.
