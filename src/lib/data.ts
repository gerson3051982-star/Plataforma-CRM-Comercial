import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { contactSearchSchema, activityFilterSchema } from "@/lib/validators";

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export type ContactWithRelations = Prisma.ContactGetPayload<{
  include: {
    company: true;
    owner: true;
    tags: {
      include: {
        tag: true;
      };
    };
    activities: {
      select: {
        id: true;
        type: true;
        subject: true;
        status: true;
        scheduledFor: true;
        createdAt: true;
      };
      orderBy: {
        createdAt: "desc";
      };
      take: 3;
    };
    opportunities: {
      select: {
        id: true;
        title: true;
        status: true;
      };
    };
  };
}>;

export type OpportunityWithRelations = Prisma.OpportunityGetPayload<{
  include: {
    company: true;
    contact: true;
    owner: true;
    activities: {
      select: {
        id: true;
        type: true;
        status: true;
        subject: true;
        dueDate: true;
      };
      orderBy: {
        createdAt: "desc";
      };
      take: 2;
    };
  };
}>;

export type ActivityWithRelations = Prisma.ActivityGetPayload<{
  include: {
    contact: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
      };
    };
    opportunity: {
      select: {
        id: true;
        title: true;
        status: true;
      };
    };
    teamMember: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

export type ContactGroup = {
  key: string;
  label: string;
  contacts: ContactWithRelations[];
};

export async function listContacts(
  searchParams: Record<string, string | string[] | undefined>,
  options?: { page?: number; pageSize?: number }
) {
  const parseResult = contactSearchSchema.safeParse({
    query: Array.isArray(searchParams.query) ? searchParams.query[0] : searchParams.query,
    groupBy: Array.isArray(searchParams.groupBy) ? searchParams.groupBy[0] : searchParams.groupBy,
  });

  if (!parseResult.success) {
    throw new Error("Parámetros de búsqueda inválidos");
  }

  const { query, groupBy } = parseResult.data;
  const tokens = query
    ?.trim()
    .split(/\s+/)
    .filter((token) => token.length > 0) ?? [];

  const where: Prisma.ContactWhereInput | undefined = tokens.length
    ? {
        AND: tokens.map((token) => ({
          OR: [
            { firstName: { contains: token, mode: "insensitive" } },
            { lastName: { contains: token, mode: "insensitive" } },
            { email: { contains: token, mode: "insensitive" } },
            { phone: { contains: token, mode: "insensitive" } },
            { company: { name: { contains: token, mode: "insensitive" } } },
            {
              tags: {
                some: {
                  tag: {
                    name: { contains: token, mode: "insensitive" },
                  },
                },
              },
            },
          ],
        })),
      }
    : undefined;

  const pageSize = Math.max(1, options?.pageSize ?? 20);
  const page = Math.max(1, options?.page ?? 1);
  const skip = (page - 1) * pageSize;

  const [total, contacts] = await Promise.all([
    prisma.contact.count({ where }),
    prisma.contact.findMany({
      where,
      include: {
        company: true,
        owner: true,
        tags: {
          include: {
            tag: true,
          },
        },
        activities: {
          select: {
            id: true,
            type: true,
            subject: true,
            status: true,
            scheduledFor: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        opportunities: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip,
      take: pageSize,
    }),
  ]);

  const groups = groupContacts(contacts, groupBy ?? "none");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    contacts,
    groups,
    groupBy: groupBy ?? "none",
    query,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

function groupContacts(contacts: ContactWithRelations[], groupBy: "none" | "city" | "company" | "tag"): ContactGroup[] {
  if (groupBy === "none") {
    return [
      {
        key: "all",
        label: `Todos (${contacts.length})`,
        contacts,
      },
    ];
  }

  const groupsMap = new Map<string, ContactWithRelations[]>();

  const ensureGroup = (key: string) => {
    if (!groupsMap.has(key)) {
      groupsMap.set(key, []);
    }
    return groupsMap.get(key)!;
  };

  if (groupBy === "tag") {
    for (const contact of contacts) {
      if (!contact.tags.length) {
        ensureGroup("Sin etiquetas").push(contact);
      } else {
        for (const tag of contact.tags) {
          ensureGroup(tag.tag.name).push(contact);
        }
      }
    }
  } else if (groupBy === "city") {
    for (const contact of contacts) {
      const key = contact.city ?? "Sin ciudad";
      ensureGroup(key).push(contact);
    }
  } else if (groupBy === "company") {
    for (const contact of contacts) {
      const key = contact.company?.name ?? "Sin empresa";
      ensureGroup(key).push(contact);
    }
  }

  return Array.from(groupsMap.entries())
    .map(([key, groupContacts]) => ({
      key,
      label: `${key} (${groupContacts.length})`,
      contacts: groupContacts,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export async function listOpportunities(options?: { page?: number; pageSize?: number; status?: "NEW" | "IN_PROGRESS" | "WON" | "LOST"; teamMemberId?: number }) {
  const { status: filterStatus, teamMemberId } = options ?? {};
  const pageSize = Math.max(1, options?.pageSize ?? (filterStatus ? 12 : 3));
  const page = Math.max(1, options?.page ?? 1);
  const skip = filterStatus ? (page - 1) * pageSize : 0;

  const statuses: Array<"NEW" | "IN_PROGRESS" | "WON" | "LOST"> = [
    "NEW",
    "IN_PROGRESS",
    "WON",
    "LOST",
  ];

  const countsRaw = await prisma.opportunity.groupBy({
    by: ["status"],
    _count: { id: true },
    ...(teamMemberId ? { where: { ownerId: teamMemberId } } : {}),
  });

  const counts = countsRaw.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count.id;
    return acc;
  }, {});

  const opportunitiesByStatus = await Promise.all(
    statuses.map((status) => {
      const isActive = !filterStatus || filterStatus === status;
      if (!isActive) {
        return Promise.resolve<OpportunityWithRelations[]>([]);
      }
      const take = pageSize;
      const skipValue = filterStatus === status ? skip : 0;
      return prisma.opportunity.findMany({
        where: {
          status,
          ...(teamMemberId ? { ownerId: teamMemberId } : {}),
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          title: true,
          description: true,
          value: true,
          status: true,
          estimatedCloseDate: true,
          companyId: true,
          contactId: true,
          ownerId: true,
          company: true,
          contact: true,
          owner: true,
          activities: {
            select: {
              id: true,
              type: true,
              status: true,
              subject: true,
              dueDate: true,
            },
            orderBy: { createdAt: "desc" },
            take: 2,
          },
        },
        orderBy: [{ updatedAt: "desc" }],
        skip: skipValue,
        take,
      });
    })
  );

  const pipeline: Record<"NEW" | "IN_PROGRESS" | "WON" | "LOST", OpportunityWithRelations[]> = {
    NEW: opportunitiesByStatus[0],
    IN_PROGRESS: opportunitiesByStatus[1],
    WON: opportunitiesByStatus[2],
    LOST: opportunitiesByStatus[3],
  };

  const totalPages = filterStatus
    ? Math.max(1, Math.ceil((counts[filterStatus] ?? 0) / pageSize))
    : 1;

  const total = filterStatus
    ? counts[filterStatus] ?? 0
    : statuses.reduce((acc, status) => acc + (counts[status] ?? 0), 0);

  return {
    pipeline,
    counts,
    pagination: {
      page: filterStatus ? page : 1,
      pageSize,
      total,
      totalPages,
    },
    activeStatus: filterStatus ?? null,
  };
}

export async function getDashboardMetrics(teamMemberId?: number | null) {
  const contactWhere = teamMemberId ? { ownerId: teamMemberId } : undefined;
  const opportunityWhere = teamMemberId ? { ownerId: teamMemberId } : undefined;
  const activityWhere = teamMemberId ? { teamMemberId } : undefined;

  const [contactCount, activityCount, opportunityAggregations, upcomingActivities] = await Promise.all([
    prisma.contact.count(contactWhere ? { where: contactWhere } : undefined),
    prisma.activity.count(activityWhere ? { where: activityWhere } : undefined),
    prisma.opportunity.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { value: true },
      ...(opportunityWhere ? { where: opportunityWhere } : {}),
    }),
    prisma.activity.findMany({
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
        opportunity: {
          select: { id: true, title: true },
        },
      },
      where: {
        ...(activityWhere ? { teamMemberId } : {}),
        OR: [
          { dueDate: { gte: new Date(), lte: addDays(new Date(), 7) } },
          { scheduledFor: { gte: new Date(), lte: addDays(new Date(), 7) } },
        ],
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
  ]);

  const pipelineTotals = opportunityAggregations.reduce(
    (acc, current) => {
      const key = current.status as keyof typeof acc;
      acc[key] = {
        count: current._count.id,
        value: Number(current._sum.value ?? 0),
      };
      return acc;
    },
    {
      NEW: { count: 0, value: 0 },
      IN_PROGRESS: { count: 0, value: 0 },
      WON: { count: 0, value: 0 },
      LOST: { count: 0, value: 0 },
    } satisfies Record<"NEW" | "IN_PROGRESS" | "WON" | "LOST", { count: number; value: number }>
  );

  return {
    contactCount,
    activityCount,
    pipelineTotals,
    upcomingActivities,
  };
}

export async function getOpportunityById(id: number) {
  return prisma.opportunity.findUnique({
    where: { id },
    include: {
      company: true,
      contact: true,
      owner: true,
      activities: {
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          teamMember: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
}

export async function listActivities(
  searchParams: Record<string, string | string[] | undefined>,
  options?: { page?: number; pageSize?: number; teamMemberId?: number }
) {
  const parseResult = activityFilterSchema.safeParse({
    type: Array.isArray(searchParams.type) ? searchParams.type[0] : searchParams.type,
    dateField: Array.isArray(searchParams.dateField) ? searchParams.dateField[0] : searchParams.dateField,
    from: Array.isArray(searchParams.from) ? searchParams.from[0] : searchParams.from,
    to: Array.isArray(searchParams.to) ? searchParams.to[0] : searchParams.to,
  });

  if (!parseResult.success) {
    throw new Error("Parámetros de filtro inválidos");
  }

  const { type, dateField, from, to } = parseResult.data;
  const teamMemberId = options?.teamMemberId;

  const where: Prisma.ActivityWhereInput = teamMemberId ? { teamMemberId } : {};

  if (type && type !== "ALL") {
    where.type = type;
  }

  if (from || to) {
    const range: Prisma.DateTimeFilter = {};
    if (from) {
      range.gte = from;
    }
    if (to) {
      range.lte = to;
    }

    switch (dateField ?? "created") {
      case "scheduled":
        where.scheduledFor = range;
        break;
      case "due":
        where.dueDate = range;
        break;
      case "resolved":
        where.completedAt = range;
        break;
      case "created":
      default:
        where.createdAt = range;
        break;
    }
  }

  const pageSize = Math.max(1, options?.pageSize ?? 20);
  const page = Math.max(1, options?.page ?? 1);
  const skip = (page - 1) * pageSize;

  const [total, activities] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        opportunity: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        teamMember: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    activities,
    filters: {
      type: type ?? "ALL",
      dateField: dateField ?? "created",
      from,
      to,
    },
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

export async function getActivityById(id: number) {
  return prisma.activity.findUnique({
    where: { id },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      opportunity: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      teamMember: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function listCompanies() {
  return prisma.company.findMany({
    orderBy: { name: "asc" },
  });
}

export async function listCompanyOptions(limit = 200) {
  return prisma.company.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
    take: limit,
  });
}

export async function listTags() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
}

export async function listTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: { name: "asc" },
  });
}

export async function listContactOptions(limit = 200) {
  return prisma.contact.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function listOpportunityOptions(limit = 200) {
  return prisma.opportunity.findMany({
    select: {
      id: true,
      title: true,
      status: true,
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}
