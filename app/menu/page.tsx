import { redirect } from "next/navigation";

// The menu is the orderable menu — send /menu straight to ordering so no one
// lands on a read-only menu and has to click "Order Now" again.
export default function MenuRedirect() {
  redirect("/order");
}
