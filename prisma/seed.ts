import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.PLATFORM_ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.PLATFORM_ADMIN_NAME?.trim() || "Platform Admin";
  const password =
    process.env.PLATFORM_ADMIN_PASSWORD?.trim() || "caldenia-admin";

  if (!email) {
    console.log("Omitido: definí PLATFORM_ADMIN_EMAIL para seedear PlatformUser.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.platformUser.upsert({
    where: { email },
    update: { name, active: true, passwordHash },
    create: { email, name, active: true, passwordHash },
  });

  console.log(`PlatformUser listo: ${user.email} (${user.id})`);
  console.log(`Password (env PLATFORM_ADMIN_PASSWORD o default): configurada`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
