import { NextRequest, NextResponse } from "next/server";
import { sendDeliEmail } from "@/lib/email";

type CateringIn = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  eventDate?: string;
  headcount?: string;
  service?: string;
  details?: string;
};

export async function POST(req: NextRequest) {
  let body: CateringIn;
  try {
    body = (await req.json()) as CateringIn;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const phone = (body.phone || "").trim();
  if (!name || !email || !phone) {
    return NextResponse.json(
      { ok: false, error: "Name, email, and phone are required." },
      { status: 400 }
    );
  }

  const inquiryId = `CAT-${Date.now().toString(36).toUpperCase()}`;
  const text = [
    `NEW CATERING INQUIRY  ${inquiryId}`,
    ``,
    `Name:      ${name}`,
    `Email:     ${email}`,
    `Phone:     ${phone}`,
    body.company ? `Company:   ${body.company}` : ``,
    body.eventDate ? `Date:      ${body.eventDate}` : ``,
    body.headcount ? `Headcount: ${body.headcount}` : ``,
    body.service ? `Service:   ${body.service}` : ``,
    ``,
    `Details:`,
    body.details?.trim() || "(none provided)",
    ``,
    `Reminder: catering needs 24 hours' notice, 8-person minimum.`,
  ]
    .filter(Boolean)
    .join("\n");

  const emailRes = await sendDeliEmail({
    subject: `Catering inquiry ${inquiryId} — ${name}`,
    text,
    replyTo: email,
  });

  return NextResponse.json({ ok: true, inquiryId, emailSent: emailRes.sent });
}
