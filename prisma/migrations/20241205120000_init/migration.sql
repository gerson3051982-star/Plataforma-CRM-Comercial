-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "crm_app";

-- CreateEnum
CREATE TYPE "crm_app"."ActivityStatus" AS ENUM ('PLANNED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "crm_app"."ActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'TASK');

-- CreateEnum
CREATE TYPE "crm_app"."OpportunityStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "crm_app"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_app"."Activity" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "crm_app"."ActivityType" NOT NULL,
    "status" "crm_app"."ActivityStatus" NOT NULL DEFAULT 'PLANNED',
    "subject" TEXT NOT NULL,
    "notes" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "contactId" INTEGER,
    "opportunityId" INTEGER,
    "teamMemberId" INTEGER,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_app"."Company" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "industry" TEXT,
    "website" TEXT,
    "description" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_app"."Contact" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "jobTitle" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "notes" TEXT,
    "companyId" INTEGER,
    "ownerId" INTEGER,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_app"."ContactTag" (
    "contactId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactTag_pkey" PRIMARY KEY ("contactId","tagId")
);

-- CreateTable
CREATE TABLE "crm_app"."Opportunity" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "value" DECIMAL(12,2),
    "status" "crm_app"."OpportunityStatus" NOT NULL DEFAULT 'NEW',
    "estimatedCloseDate" TIMESTAMP(3),
    "companyId" INTEGER,
    "contactId" INTEGER,
    "ownerId" INTEGER,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_app"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_app"."Tag" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_app"."TeamMember" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "userId" TEXT,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_app"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT DEFAULT 'member',
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_app"."VerificationToken" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "crm_app"."Account"("provider" ASC, "providerAccountId" ASC);

-- CreateIndex
CREATE INDEX "Activity_dueDate_idx" ON "crm_app"."Activity"("dueDate" ASC);

-- CreateIndex
CREATE INDEX "Activity_scheduledFor_idx" ON "crm_app"."Activity"("scheduledFor" ASC);

-- CreateIndex
CREATE INDEX "Activity_teamMemberId_idx" ON "crm_app"."Activity"("teamMemberId" ASC);

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "crm_app"."Activity"("type" ASC);

-- CreateIndex
CREATE INDEX "Company_city_idx" ON "crm_app"."Company"("city" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_city_country_key" ON "crm_app"."Company"("name" ASC, "city" ASC, "country" ASC);

-- CreateIndex
CREATE INDEX "Contact_city_idx" ON "crm_app"."Contact"("city" ASC);

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "crm_app"."Contact"("companyId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "crm_app"."Contact"("email" ASC);

-- CreateIndex
CREATE INDEX "Contact_lastName_idx" ON "crm_app"."Contact"("lastName" ASC);

-- CreateIndex
CREATE INDEX "Opportunity_companyId_idx" ON "crm_app"."Opportunity"("companyId" ASC);

-- CreateIndex
CREATE INDEX "Opportunity_contactId_idx" ON "crm_app"."Opportunity"("contactId" ASC);

-- CreateIndex
CREATE INDEX "Opportunity_estimatedCloseDate_idx" ON "crm_app"."Opportunity"("estimatedCloseDate" ASC);

-- CreateIndex
CREATE INDEX "Opportunity_status_idx" ON "crm_app"."Opportunity"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "crm_app"."Session"("sessionToken" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "crm_app"."Tag"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "crm_app"."TeamMember"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_userId_key" ON "crm_app"."TeamMember"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "crm_app"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "crm_app"."VerificationToken"("identifier" ASC, "token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "crm_app"."VerificationToken"("token" ASC);

-- AddForeignKey
ALTER TABLE "crm_app"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "crm_app"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."Activity" ADD CONSTRAINT "Activity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_app"."Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."Activity" ADD CONSTRAINT "Activity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "crm_app"."Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."Activity" ADD CONSTRAINT "Activity_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "crm_app"."TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "crm_app"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."Contact" ADD CONSTRAINT "Contact_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "crm_app"."TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."ContactTag" ADD CONSTRAINT "ContactTag_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_app"."Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."ContactTag" ADD CONSTRAINT "ContactTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "crm_app"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."Opportunity" ADD CONSTRAINT "Opportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "crm_app"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."Opportunity" ADD CONSTRAINT "Opportunity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_app"."Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."Opportunity" ADD CONSTRAINT "Opportunity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "crm_app"."TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "crm_app"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_app"."TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "crm_app"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

