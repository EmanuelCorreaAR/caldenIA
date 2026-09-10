import { redirect } from "next/navigation";

/** Accesos viven por empresa: Clientes → empresa → Accesos portal */
export default function EquipoRedirectPage() {
  redirect("/app/clientes");
}
