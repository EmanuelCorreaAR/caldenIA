import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";

export const SESSION_COOKIE = "caldenia_session";

export type PlatformSession = {
  kind: "platform";
  userId: string;
  email: string;
  name: string;
};

export type TenantSession = {
  kind: "tenant";
  userId: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  email: string;
  name: string;
  role: UserRole;
  /** Solo role CLIENT */
  clientId?: string | null;
  clientName?: string | null;
  mustChangePassword?: boolean;
  tenantLogoUrl?: string | null;
};

export type Session = PlatformSession | TenantSession;

function authSecret(): string {
  const secret =
    process.env.AUTH_SECRET?.trim() ||
    process.env.PLATFORM_ADMIN_SECRET?.trim();
  if (!secret) {
    throw new Error("Falta AUTH_SECRET (o PLATFORM_ADMIN_SECRET) en .env");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

function encodeSession(session: Session): string {
  const body = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string): Session | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (parsed?.kind !== "platform" && parsed?.kind !== "tenant") return null;
    return parsed as Session;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

export async function setSession(session: Session): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete("caldenia_platform");
}

export async function requirePlatformSession(): Promise<PlatformSession> {
  const session = await getSession();
  if (!session || session.kind !== "platform") {
    const { redirect } = await import("next/navigation");
    redirect("/?next=/admin");
  }
  return session as PlatformSession;
}

/** Profesional de la marca (no portal cliente). */
export async function requireTenantSession(): Promise<TenantSession> {
  const session = await getSession();
  if (!session || session.kind !== "tenant") {
    const { redirect } = await import("next/navigation");
    redirect("/?next=/app");
  }
  const tenant = session as TenantSession;
  if (tenant.mustChangePassword) {
    const { redirect } = await import("next/navigation");
    redirect("/cambiar-clave");
  }
  if (tenant.role === "CLIENT") {
    const { redirect } = await import("next/navigation");
    redirect("/portal");
  }
  return tenant;
}

/** Usuario portal de una empresa cliente. */
export async function requireClientSession(): Promise<
  TenantSession & { clientId: string }
> {
  const session = await getSession();
  if (!session || session.kind !== "tenant") {
    const { redirect } = await import("next/navigation");
    redirect("/?next=/portal");
  }
  const tenant = session as TenantSession;
  if (tenant.mustChangePassword) {
    const { redirect } = await import("next/navigation");
    redirect("/cambiar-clave");
  }
  if (tenant.role !== "CLIENT" || !tenant.clientId) {
    const { redirect } = await import("next/navigation");
    redirect(homeForSession(tenant));
  }
  return tenant as TenantSession & { clientId: string };
}

export function homeForSession(session: Session): string {
  if (session.kind === "platform") return "/admin";
  if (session.mustChangePassword) return "/cambiar-clave";
  if (session.role === "CLIENT") return "/portal";
  return "/app";
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
