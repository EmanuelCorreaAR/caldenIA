import { redirect } from "next/navigation";

/** El login es único en /login */
export default function AdminLoginRedirect() {
  redirect("/login?next=/admin");
}
