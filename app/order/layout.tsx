import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu & Online Ordering | The Brothers Deli · Minneapolis",
  description:
    "Order The Brothers Deli online for pickup or delivery — corned beef, pastrami, big salads, soups with a popover, and the Fit 500 line. Downtown Minneapolis skyway.",
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
