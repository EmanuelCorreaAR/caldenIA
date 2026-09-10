import { redirect } from "next/navigation";

/** El login es único en `/` */
export default function AdminLoginRedirect() {
  redirect("/?next=/admin");
}
