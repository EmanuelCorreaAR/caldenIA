import { redirect } from "next/navigation";

/** Compat: el acceso vive en `/` */
export default async function LoginRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const q = new URLSearchParams();
  if (params.error) q.set("error", params.error);
  if (params.next) q.set("next", params.next);
  const qs = q.toString();
  redirect(qs ? `/?${qs}` : "/");
}
