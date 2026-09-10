"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getSession,
  hashPassword,
  homeForSession,
  setSession,
  verifyPassword,
} from "@/lib/auth";

export async function changePasswordFirstLogin(formData: FormData) {
  const session = await getSession();
  if (!session || session.kind !== "tenant") {
    redirect("/?next=/cambiar-clave");
  }
  if (!session.mustChangePassword) {
    redirect(homeForSession(session));
  }

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!current || !next || !confirm) {
    redirect(
      "/cambiar-clave?error=" +
        encodeURIComponent("Completá todos los campos"),
    );
  }
  if (next.length < 8) {
    redirect(
      "/cambiar-clave?error=" +
        encodeURIComponent("La nueva contraseña debe tener al menos 8 caracteres"),
    );
  }
  if (next !== confirm) {
    redirect(
      "/cambiar-clave?error=" +
        encodeURIComponent("La confirmación no coincide"),
    );
  }
  if (next === current) {
    redirect(
      "/cambiar-clave?error=" +
        encodeURIComponent("Elegí una contraseña distinta a la temporal"),
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: session.userId, tenantId: session.tenantId },
  });
  if (!user) {
    redirect("/?error=" + encodeURIComponent("Sesión inválida"));
  }

  const ok = await verifyPassword(current, user.passwordHash);
  if (!ok) {
    redirect(
      "/cambiar-clave?error=" +
        encodeURIComponent("La contraseña actual no es correcta"),
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(next),
      mustChangePassword: false,
    },
  });

  await setSession({
    ...session,
    mustChangePassword: false,
  });

  redirect(homeForSession({ ...session, mustChangePassword: false }));
}
