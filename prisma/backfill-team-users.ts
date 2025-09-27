import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const SHARED_PASSWORD = process.env.SEED_TEAM_PASSWORD ?? "Cambia123";

async function main() {
  const passwordHash = await bcrypt.hash(SHARED_PASSWORD, 10);

  const teamMembers = await prisma.teamMember.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      userId: true,
    },
  });

  let created = 0;
  let updated = 0;

  for (const member of teamMembers) {
    if (!member.email) {
      continue;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: member.email },
      select: { id: true },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: member.name,
          role: member.role ?? "member",
          passwordHash,
        },
      });
      updated += 1;

      if (!member.userId || member.userId !== existingUser.id) {
        await prisma.teamMember.update({
          where: { id: member.id },
          data: { userId: existingUser.id },
        });
      }
    } else {
      const createdUser = await prisma.user.create({
        data: {
          email: member.email,
          name: member.name,
          role: member.role ?? "member",
          passwordHash,
        },
      });
      created += 1;

      await prisma.teamMember.update({
        where: { id: member.id },
        data: { userId: createdUser.id },
      });
    }
  }

  console.log(`Usuarios creados: ${created}`);
  console.log(`Usuarios actualizados: ${updated}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
