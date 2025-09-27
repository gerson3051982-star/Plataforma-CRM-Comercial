import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/lib/auth";
import {
  listTags,
  listTeamMembers,
  listCompanyOptions,
  listContactOptions,
  listOpportunityOptions,
} from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [tags, teamMembersRaw, companies, contactOptionsRaw, opportunityOptionsRaw] = await Promise.all([
    listTags(),
    listTeamMembers(),
    listCompanyOptions(200),
    listContactOptions(200),
    listOpportunityOptions(200),
  ]);

  const teamMembers = teamMembersRaw.map((member) => ({
    id: member.id,
    name: member.name,
  }));

  const teamMemberOptions = teamMembersRaw.map((member) => ({
    id: member.id,
    label: member.name,
  }));

  const tagsOptions = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  }));

  const companyOptions = companies.map((company) => ({
    id: company.id,
    label: company.name,
  }));

  const contactOptions = contactOptionsRaw.map((contact) => {
    const baseName = `${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim();
    return {
      id: contact.id,
      label: contact.email ? `${baseName} · ${contact.email}` : baseName,
    };
  });

  const opportunityOptions = opportunityOptionsRaw.map((opportunity) => ({
    id: opportunity.id,
    label: `${opportunity.title} (${opportunity.status})`,
  }));

  return (
    <AppShell
      user={session.user}
      quickCreate={{
        contact: {
          teamMembers,
          tags: tagsOptions,
        },
        opportunity: {
          companies: companyOptions,
          contacts: contactOptions,
          teamMembers: teamMemberOptions,
        },
        activity: {
          contacts: contactOptions,
          opportunities: opportunityOptions,
          teamMembers: teamMemberOptions,
        },
      }}
    >
      {children}
    </AppShell>
  );
}
