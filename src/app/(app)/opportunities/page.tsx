import Link from "next/link";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { listOpportunities, listCompanies, listContactOptions, listTeamMembers } from "@/lib/data";
import { auth } from "@/lib/auth";
import type { OpportunityWithRelations } from "@/lib/data";
import { classNames, formatCurrency } from "@/lib/utils";

const columns = [
  {
    status: "NEW" as const,
    title: "Nuevas",
    description: "Leads recién capturados",
  },
  {
    status: "IN_PROGRESS" as const,
    title: "En progreso",
    description: "Negociaciones activas",
  },
  {
    status: "WON" as const,
    title: "Ganadas",
    description: "Cierres confirmados",
  },
  {
    status: "LOST" as const,
    title: "Perdidas",
    description: "Recupera oportunidades",
  },
];

const statusOptions = ["NEW", "IN_PROGRESS", "WON", "LOST"] as const;
type StatusOption = (typeof statusOptions)[number];

const statusAliases: Record<string, StatusOption> = {
  new: "NEW",
  nueva: "NEW",
  nuevas: "NEW",
  // Mantener compatibilidad con UI y posibles permalinks en español
  "en progreso": "IN_PROGRESS",
  "en-progreso": "IN_PROGRESS",
  "en_progreso": "IN_PROGRESS",
  progreso: "IN_PROGRESS",
  inprogress: "IN_PROGRESS",
  "in-progress": "IN_PROGRESS",
  "in_progress": "IN_PROGRESS",
  ganada: "WON",
  ganadas: "WON",
  won: "WON",
  perdida: "LOST",
  perdidas: "LOST",
  lost: "LOST",
};

function normalizeStatusValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function parseStatusParam(value: string | string[] | undefined): StatusOption | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;

  const normalized = normalizeStatusValue(raw);
  const aliasMatch = statusAliases[normalized];
  if (aliasMatch) {
    return aliasMatch;
  }

  const columnMatch = columns.find((column) => normalizeStatusValue(column.title) === normalized);
  if (columnMatch) {
    return columnMatch.status;
  }

  const canonical = normalized.replace(/[\s-]+/g, "_").toUpperCase();
  return statusOptions.find((status) => status === canonical) as StatusOption | undefined;
}

function buildStatusHref(status?: StatusOption) {
  const query: Record<string, string> = {};
  if (status) {
    query.status = status;
  }
  return { pathname: "/opportunities", query } as const;
}

type RawSearchParams = Record<string, string | string[] | undefined>;

type OpportunitiesPageProps = {
  searchParams?: Promise<RawSearchParams> | RawSearchParams;
};

function parsePage(searchParams: RawSearchParams) {
  const raw = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  const resolvedSearchParams = ((await Promise.resolve(searchParams)) ?? {}) as RawSearchParams;
  const filterStatus = parseStatusParam(resolvedSearchParams.status);
  const page = filterStatus ? parsePage(resolvedSearchParams) : 1;
  const pageSize = filterStatus ? 12 : 3;

  const session = await auth();
  const currentUser = session?.user
    ? (session.user as typeof session.user & { teamMemberId?: number | null; role?: string | null })
    : undefined;
  const isAdmin = currentUser?.role === "admin";
  const teamMemberId = isAdmin ? undefined : currentUser?.teamMemberId ?? undefined;

  const [{ pipeline, counts, pagination }, companies, contacts, team] = await Promise.all([
    listOpportunities({ page, pageSize, status: filterStatus, teamMemberId }),
    listCompanies(),
    listContactOptions(150),
    listTeamMembers(),
  ]);

  const companyOptions = companies.map((company) => ({ id: company.id, label: company.name }));
  const contactOptions = contacts.map((contact) => ({
    id: contact.id,
    label: `${contact.firstName} ${contact.lastName}${contact.email ? ` · ${contact.email}` : ""}`,
  }));
  const teamOptions = team.map((member) => ({ id: member.id, label: member.name }));

  const serializeOpportunity = (opportunity: OpportunityWithRelations) => ({
    ...opportunity,
    value: opportunity.value ? Number(opportunity.value) : null,
  });

  const mappedPipeline = {
    NEW: pipeline.NEW.map(serializeOpportunity),
    IN_PROGRESS: pipeline.IN_PROGRESS.map(serializeOpportunity),
    WON: pipeline.WON.map(serializeOpportunity),
    LOST: pipeline.LOST.map(serializeOpportunity),
  } as const;

  const visibleColumns = filterStatus ? columns.filter((column) => column.status === filterStatus) : columns;
  const summaryColumns = columns;
  const totalOpportunities = filterStatus
    ? pagination.total
    : statusOptions.reduce((acc, status) => acc + (counts[status] ?? 0), 0);
  const buildFilteredHref = (targetPage: number) => {
    const query: Record<string, string> = {};
    if (filterStatus) {
      query.status = filterStatus;
    }
    if (targetPage > 1) {
      query.page = String(targetPage);
    }
    return { pathname: "/opportunities", query } as const;
  };
  const prevHref = pagination.page > 1 ? buildFilteredHref(pagination.page - 1) : null;
  const nextHref = pagination.page < pagination.totalPages ? buildFilteredHref(pagination.page + 1) : null;
  const showPagination = filterStatus ? pagination.totalPages > 1 : false;
  const activeColumn = filterStatus ? columns.find((column) => column.status === filterStatus) : undefined;
  const columnsToRender = filterStatus ? visibleColumns : columns;


  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Pipeline comercial</h2>
              <p className="mt-2 text-sm text-slate-500">
                Visualiza tus 30 oportunidades actuales en un pipeline colaborativo y enfocado en resultados.
              </p>
            </div>
            <p className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Vista {pagination.page} de {pagination.totalPages}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-2">
            {summaryColumns.map((column) => {
              const items = mappedPipeline[column.status] ?? [];
              const totalValue = items.reduce((acc, item) => acc + Number(item.value ?? 0), 0);
              const isActive = filterStatus === column.status;
              return (
                <Link
                  key={column.status}
                  href={buildStatusHref(column.status)}
                  className={classNames(
                    "block rounded-2xl border px-4 py-3 transition",
                    isActive
                      ? "border-[var(--accent-300)] bg-[var(--accent-50)] text-[var(--text-strong)]"
                      : "border-slate-200 bg-slate-50 hover:border-[var(--accent-200)] hover:bg-[var(--surface-hover)]"
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{column.title}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {counts[column.status] ?? 0} registros · {formatCurrency(totalValue)}
                  </p>
                </Link>
              );
            })}
          </div>
          {filterStatus ? (
            <Link
              href={buildStatusHref()}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-600)] transition hover:text-[var(--accent-700)]"
            >
              Limpiar filtro
            </Link>
          ) : null}
        </div>
        <div className="w-full max-w-[10rem] rounded-2xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-600 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">Pipeline en movimiento</p>
          <p className="mt-2">
            Toca <span className="font-semibold">+</span> para registrar sin pausar el flujo.
          </p>
          <ul className="mt-3 space-y-1 text-[11px] text-slate-500">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
              Cada columna muestra 20 registros por página.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
              Navega con la paginación para revisar etapas activas.
            </li>
          </ul>
        </div>
      </header>

      <section
        className={classNames(
          "grid gap-6",
          filterStatus ? "xl:grid-cols-1" : "xl:grid-cols-4"
        )}
      >
        {columnsToRender.map((column) => {
          const allItems = mappedPipeline[column.status] ?? [];
          const items = filterStatus ? allItems : allItems.slice(0, 1);
          const totalInStatus = counts[column.status] ?? 0;

          return (
            <div key={column.status} className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{column.title}</h3>
                <p className="text-sm text-slate-500">{column.description}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {filterStatus
                    ? `${totalInStatus} en total`
                    : totalInStatus === 0
                      ? "Sin oportunidades registradas"
                      : `Última actualización · ${totalInStatus} en total`}
                </p>
              </div>
              <div className="space-y-4">
                {items.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                    No hay oportunidades en esta etapa.
                  </p>
                ) : (
                  items.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      companies={companyOptions}
                      contacts={contactOptions}
                      teamMembers={teamOptions}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>

      <nav className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {filterStatus && activeColumn
            ? `${counts[filterStatus] ?? 0} oportunidades ${activeColumn.title.toLowerCase()} · vista ${pagination.page} de ${pagination.totalPages}`
            : `${totalOpportunities.toLocaleString()} oportunidades activas`}
        </p>
        {showPagination ? (
          <div className="flex items-center gap-3 text-sm font-semibold">
            {prevHref ? (
              <Link
                href={prevHref}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                ← Anterior
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 px-4 py-2 text-slate-300">
                ← Anterior
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            {nextHref ? (
              <Link
                href={nextHref}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                Siguiente →
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 px-4 py-2 text-slate-300">
                Siguiente →
              </span>
            )}
          </div>
        ) : null}
      </nav>
    </div>
  );
}
