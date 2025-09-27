import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { PrismaClient, OpportunityStatus, ActivityType, ActivityStatus } from "../src/generated/prisma";

const prisma = new PrismaClient();

const palette = ["#0ea5e9", "#6366f1", "#f59e0b", "#10b981", "#f97316", "#ec4899", "#8b5cf6", "#14b8a6"];

const emailRegistry = new Set<string>();

function uniqueEmail() {
  let email = "";
  do {
    email = faker.internet.email().toLowerCase();
  } while (emailRegistry.has(email));
  emailRegistry.add(email);
  return email;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const teamSize = Number(process.env.SEED_TEAM_SIZE ?? 500);
  const contactSize = Number(process.env.SEED_CONTACT_SIZE ?? 5000);
  const opportunitySize = Number(process.env.SEED_OPPORTUNITY_SIZE ?? 30);
  const activitySize = Number(process.env.SEED_ACTIVITY_SIZE ?? 800);

  console.log("🔄 Limpiando datos previos...");
  await prisma.$transaction([
    prisma.activity.deleteMany(),
    prisma.opportunity.deleteMany(),
    prisma.contactTag.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.company.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("👥 Creando equipo...");
  const teamMembersData = Array.from({ length: teamSize }, () => ({
    name: faker.person.fullName(),
    email: uniqueEmail(),
    role: faker.person.jobTitle(),
  }));
  await prisma.teamMember.createMany({ data: teamMembersData, skipDuplicates: true });
  const teamMembers = await prisma.teamMember.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log("🔐 Creando cuentas para el equipo...");
  const sharedPassword = process.env.SEED_TEAM_PASSWORD ?? "Cambia123";
  const sharedPasswordHash = await bcrypt.hash(sharedPassword, 10);

  await prisma.user.createMany({
    data: teamMembers.map((member) => ({
      email: member.email,
      name: member.name,
      role: member.role ?? "member",
      passwordHash: sharedPasswordHash,
    })),
    skipDuplicates: true,
  });

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: teamMembers.map((member) => member.email),
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  const userByEmail = new Map(users.map((user) => [user.email, user.id]));

  await Promise.all(
    teamMembers.map((member) =>
      prisma.teamMember.update({
        where: { id: member.id },
        data: {
          userId: userByEmail.get(member.email),
        },
      })
    )
  );

  console.log("🏢 Creando empresas...");
  const companyCount = Math.min(Math.floor(contactSize / 20), 200);
  const companiesData = Array.from({ length: companyCount }, () => ({
    name: faker.company.name(),
    city: faker.location.city(),
    country: faker.location.country(),
    industry: faker.commerce.department(),
    website: faker.internet.url(),
    description: faker.company.catchPhrase(),
  }));
  await prisma.company.createMany({ data: companiesData, skipDuplicates: true });
  const companies = await prisma.company.findMany({ select: { id: true } });

  console.log("🏷️ Creando etiquetas...");
  const baseTags = [
    "VIP",
    "Prioridad Alta",
    "Demo pendiente",
    "Renovación",
    "Upsell",
    "Soporte",
    "Marketing",
    "Clientes clave",
  ];
  await prisma.tag.createMany({
    data: baseTags.map((name, index) => ({ name, color: palette[index % palette.length] })),
    skipDuplicates: true,
  });
  const tags = await prisma.tag.findMany({ select: { id: true } });

  console.log("📇 Creando contactos...");
  const contactsData = Array.from({ length: contactSize }, () => {
    const company = faker.helpers.arrayElement(companies);
    const owner = faker.helpers.arrayElement(teamMembers);
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: uniqueEmail(),
      phone: faker.phone.number(),
      jobTitle: faker.person.jobTitle(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      notes: faker.lorem.sentence(),
      companyId: company?.id,
      ownerId: owner?.id,
    };
  });

  for (const group of chunk(contactsData, 500)) {
    await prisma.contact.createMany({ data: group, skipDuplicates: true });
  }
  const contacts = await prisma.contact.findMany({ select: { id: true, companyId: true } });

  console.log("🔖 Vinculando etiquetas a contactos...");
  const contactTagData: { contactId: number; tagId: number }[] = [];
  for (const contact of contacts) {
    const tagCount = faker.number.int({ min: 0, max: 3 });
    const assignedTags = faker.helpers.arrayElements(tags, tagCount);
    for (const tag of assignedTags) {
      contactTagData.push({ contactId: contact.id, tagId: tag.id });
    }
  }
  for (const group of chunk(contactTagData, 1000)) {
    await prisma.contactTag.createMany({ data: group, skipDuplicates: true });
  }

  console.log("📈 Creando oportunidades...");
  const opportunityStatuses: OpportunityStatus[] = [
    OpportunityStatus.NEW,
    OpportunityStatus.IN_PROGRESS,
    OpportunityStatus.WON,
    OpportunityStatus.LOST,
  ];
  const opportunitiesData = Array.from({ length: opportunitySize }, (_, index) => {
    const contact = faker.helpers.arrayElement(contacts);
    const company = contact.companyId
      ? { id: contact.companyId }
      : faker.helpers.arrayElement(companies);
    const owner = faker.helpers.arrayElement(teamMembers);
    const status = opportunityStatuses[index % opportunityStatuses.length];
    return {
      title: `${faker.company.buzzPhrase()} - ${faker.company.name()}`,
      description: faker.lorem.sentences(2),
      value: faker.number.int({ min: 5000, max: 200000 }).toString(),
      status,
      estimatedCloseDate: faker.date.between({ from: new Date(), to: faker.date.soon({ days: 120 }) }),
      companyId: company?.id,
      contactId: contact.id,
      ownerId: owner.id,
    };
  });
  await prisma.opportunity.createMany({ data: opportunitiesData, skipDuplicates: true });
  const opportunities = await prisma.opportunity.findMany({ select: { id: true, contactId: true } });

  console.log("📞 Registrando actividades...");
  const activityTypes: ActivityType[] = [
    ActivityType.CALL,
    ActivityType.EMAIL,
    ActivityType.MEETING,
    ActivityType.TASK,
  ];
  const activityStatuses: ActivityStatus[] = [
    ActivityStatus.PLANNED,
    ActivityStatus.COMPLETED,
    ActivityStatus.CANCELLED,
  ];
  const activitiesData = Array.from({ length: activitySize }, () => {
    const contact = faker.helpers.arrayElement(contacts);
    const opportunity = Math.random() < 0.4 ? faker.helpers.arrayElement(opportunities) : undefined;
    const type = faker.helpers.arrayElement(activityTypes);
    const status = faker.helpers.arrayElement(activityStatuses);
    const baseDate = faker.date.recent({ days: 45 });

    return {
      type,
      status,
      subject: `${type} con ${faker.company.name()}`,
      notes: faker.lorem.sentence(),
      scheduledFor: faker.date.between({ from: baseDate, to: faker.date.soon({ days: 30 }) }),
      dueDate: faker.date.soon({ days: 60 }),
      completedAt: status === ActivityStatus.COMPLETED ? faker.date.recent({ days: 10 }) : null,
      contactId: contact.id,
      opportunityId: opportunity?.id ?? null,
      teamMemberId: faker.helpers.arrayElement(teamMembers).id,
    };
  });
  for (const group of chunk(activitiesData, 500)) {
    await prisma.activity.createMany({ data: group, skipDuplicates: true });
  }

  console.log("👤 Creando usuario administrador...");
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@crm.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Cambiar123!";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      role: "admin",
      name: "Administrador CRM",
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      role: "admin",
      name: "Administrador CRM",
    },
  });

  await prisma.teamMember.upsert({
    where: { email: adminEmail },
    update: {
      userId: adminUser.id,
      role: "Administrador",
    },
    create: {
      name: "Administrador CRM",
      email: adminEmail,
      role: "Administrador",
      userId: adminUser.id,
    },
  });

  console.log("✅ Seed completado");
  console.table({
    teamMembers: teamMembers.length,
    companies: companies.length,
    contacts: contacts.length,
    contactTags: contactTagData.length,
    opportunities: opportunities.length,
    activities: activitiesData.length,
  });
}

main()
  .catch((error) => {
    console.error("❌ Error al ejecutar el seed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
