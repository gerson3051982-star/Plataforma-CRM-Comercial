import "dotenv/config";
import { spawn } from "node:child_process";
import { PrismaClient, Prisma } from "@/generated/prisma";

const resolvedRemoteUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL_REMOTE ?? process.env.DATABASE_URL;

if (!resolvedRemoteUrl) {
  throw new Error("POSTGRES_URL (remote database) is not defined in the environment");
}

const remoteUrl = resolvedRemoteUrl;

async function runPrismaMigrate(url: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npx", ["prisma", "migrate", "deploy", "--schema", "prisma/schema.prisma"], {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: url },
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`prisma migrate deploy exited with code ${code}`));
      }
    });
  });
}

function serializeRecord(record: Record<string, unknown>) {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) continue;

    if (value instanceof Date) {
      result[key] = value;
      continue;
    }

    if (value && typeof value === "object" && "constructor" in value && value.constructor?.name === "Decimal") {
      result[key] = value.toString();
      continue;
    }

    result[key] = value;
  }

  return result;
}

async function copyTable(
  label: string,
  fetch: () => Promise<Record<string, unknown>[]>,
  insert: (rows: Record<string, unknown>[]) => Promise<unknown>,
) {
  const records = await fetch();
  if (records.length === 0) {
    console.log(`No records to copy for ${label}`);
    return;
  }

  const payload = records.map((record) => serializeRecord(record));
  await insert(payload);
  console.log(`Copied ${payload.length} records into ${label}`);
}

async function truncateRemote(prismaRemote: PrismaClient) {
  const tables = [
    '"VerificationToken"',
    '"SessionLog"',
    '"Session"',
    '"Account"',
    '"Activity"',
    '"Opportunity"',
    '"ContactTag"',
    '"Contact"',
    '"Tag"',
    '"Company"',
    '"TeamMember"',
    '"User"',
  ];

  const statement = `TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE;`;
  await prismaRemote.$executeRawUnsafe(statement);
}

async function syncIdentitySequences(prismaRemote: PrismaClient) {
  const sequences = [
    '"TeamMember"',
    '"Company"',
    '"Tag"',
    '"Contact"',
    '"Opportunity"',
    '"Activity"',
    '"SessionLog"',
    '"VerificationToken"',
  ];

  for (const table of sequences) {
    const query = `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false);`;
    await prismaRemote.$executeRawUnsafe(query);
  }
}

async function main() {
  console.log("Applying Prisma migrations to remote database...");
  await runPrismaMigrate(remoteUrl);

  const prismaLocal = new PrismaClient();
  const prismaRemote = new PrismaClient({
    datasources: {
      db: {
        url: remoteUrl,
      },
    },
  });

  console.log("Clearing remote database before copy...");
  await truncateRemote(prismaRemote);

  await copyTable("User", () => prismaLocal.user.findMany(), (rows) =>
    prismaRemote.user.createMany({ data: rows as Prisma.UserCreateManyInput[], skipDuplicates: true }),
  );

  await copyTable("TeamMember", () => prismaLocal.teamMember.findMany(), (rows) =>
    prismaRemote.teamMember.createMany({ data: rows as Prisma.TeamMemberCreateManyInput[], skipDuplicates: true }),
  );

  await copyTable("Company", () => prismaLocal.company.findMany(), (rows) =>
    prismaRemote.company.createMany({ data: rows as Prisma.CompanyCreateManyInput[], skipDuplicates: true }),
  );

  await copyTable("Tag", () => prismaLocal.tag.findMany(), (rows) =>
    prismaRemote.tag.createMany({ data: rows as Prisma.TagCreateManyInput[], skipDuplicates: true }),
  );

  await copyTable("Contact", () => prismaLocal.contact.findMany(), (rows) =>
    prismaRemote.contact.createMany({ data: rows as Prisma.ContactCreateManyInput[], skipDuplicates: true }),
  );

  await copyTable("ContactTag", () => prismaLocal.contactTag.findMany(), (rows) =>
    prismaRemote.contactTag.createMany({ data: rows as Prisma.ContactTagCreateManyInput[], skipDuplicates: true }),
  );

  await copyTable("Opportunity", () => prismaLocal.opportunity.findMany(), (rows) =>
    prismaRemote.opportunity.createMany({ data: rows as Prisma.OpportunityCreateManyInput[], skipDuplicates: true }),
  );

  await copyTable("Activity", () => prismaLocal.activity.findMany(), (rows) =>
    prismaRemote.activity.createMany({ data: rows as Prisma.ActivityCreateManyInput[], skipDuplicates: true }),
  );

  await copyTable("Account", () => prismaLocal.account.findMany(), (rows) =>
    prismaRemote.account.createMany({ data: rows as Prisma.AccountCreateManyInput[], skipDuplicates: true }),
  );

  await copyTable("Session", () => prismaLocal.session.findMany(), (rows) =>
    prismaRemote.session.createMany({ data: rows as Prisma.SessionCreateManyInput[], skipDuplicates: true }),
  );

  await copyTable("SessionLog", () => prismaLocal.sessionLog.findMany(), (rows) =>
    prismaRemote.sessionLog.createMany({ data: rows as Prisma.SessionLogCreateManyInput[], skipDuplicates: true }),
  );

  await copyTable("VerificationToken", () => prismaLocal.verificationToken.findMany(), (rows) =>
    prismaRemote.verificationToken.createMany({ data: rows as Prisma.VerificationTokenCreateManyInput[], skipDuplicates: true }),
  );

  await syncIdentitySequences(prismaRemote);

  await prismaLocal.$disconnect();
  await prismaRemote.$disconnect();

  console.log("Remote database synchronized with local data.");
}

main().catch(async (error) => {
  console.error("Failed to migrate data to Vercel Postgres", error);
  process.exitCode = 1;
});
