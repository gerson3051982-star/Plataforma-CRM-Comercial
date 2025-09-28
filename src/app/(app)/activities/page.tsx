import Link from "next/link";
import { ActivityItem } from "@/components/activities/activity-item";
import { listActivities, listContactOptions, listOpportunityOptions, listTeamMembers } from "@/lib/data";
import { auth } from "@/lib/auth";

const filterTypes = [
  { value: "ALL", label: "Todos" },
  { value: "CALL", label: "Llamadas" },
  { value: "EMAIL", label: "Correos" },
  { value: "MEETING", label: "Reuniones" },
  { value: "TASK", label: "Tareas" },
] as const;

const dateFieldOptions = [
  { value: "created", label: "Fecha de creación" },
  { value: "scheduled", label: "Fecha agendada" },
  { value: "due", label: "Fecha límite" },
  { value: "resolved", label: "Fecha de resolución" },
] as const;

type RawSearchParams = Record<string, string | string[] | undefined>;

type ActivitiesPageProps = {
  searchParams?: Promise<RawSearchParams> | RawSearchParams;
};

function toDateInput(value?: Date) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function parsePage(searchParams: RawSearchParams) {
  const raw = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildPageHref(searchParams: RawSearchParams, page: number) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value || key === "page") return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else {
      params.set(key, value);
    }
  });
  params.set("page", String(page));
  return `?${params.toString()}`;
}

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const resolvedSearchParams = ((await Promise.resolve(searchParams)) ?? {}) as RawSearchParams;
  const page = parsePage(resolvedSearchParams);
  const session = await auth();
  const currentUser = session?.user
    ? (session.user as typeof session.user & { teamMemberId?: number | null; role?: string | null })
    : undefined;
  const isAdmin = currentUser?.role === "admin";
  const teamMemberId = isAdmin ? undefined : currentUser?.teamMemberId ?? undefined;
  const [{ activities, filters, pagination }, contacts, opportunities, team] = await Promise.all([
    listActivities(resolvedSearchParams, { page, pageSize: 20, teamMemberId }),
    listContactOptions(200),
    listOpportunityOptions(200),
    listTeamMembers(),
  ]);

  const contactOptions = contacts.map((contact) => ({
    id: contact.id,
    label: `${contact.firstName} ${contact.lastName}${contact.email ? ` · ${contact.email}` : ""}`,
  }));
  const opportunityOptions = opportunities.map((opportunity) => ({
    id: opportunity.id,
    label: `${opportunity.title} (${opportunity.status})`,
  }));
  const teamOptions = team.map((member) => ({ id: member.id, label: member.name }));

  const { total, pageSize, page: currentPage, totalPages } = pagination;
  const hasResults = activities.length > 0;
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(currentPage * pageSize, total);
  const prevHref = currentPage > 1 ? buildPageHref(resolvedSearchParams, currentPage - 1) : null;
  const nextHref = currentPage < totalPages ? buildPageHref(resolvedSearchParams, currentPage + 1) : null;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Registro de actividades</h2>
              <p className="mt-2 text-sm text-slate-500">
                Centraliza llamadas, correos, reuniones y tareas del equipo para no perder seguimiento.
              </p>
            </div>
            <p className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Página {currentPage} de {totalPages}
            </p>
          </div>
          <form method="get" className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <input type="hidden" name="page" value="1" />
            <div className="md:col-span-1 xl:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400" htmlFor="type">
                Tipo
              </label>
              <select
                id="type"
                name="type"
                defaultValue={filters.type}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                {filterTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1 xl:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400" htmlFor="dateField">
                Tipo de fecha
              </label>
              <select
                id="dateField"
                name="dateField"
                defaultValue={filters.dateField}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                {dateFieldOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400" htmlFor="from">
                Desde
              </label>
              <input
                type="date"
                id="from"
                name="from"
                defaultValue={toDateInput(filters.from)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400" htmlFor="to">
                Hasta
              </label>
              <input
                type="date"
                id="to"
                name="to"
                defaultValue={toDateInput(filters.to)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 xl:col-span-1 xl:self-end xl:justify-self-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/20"
              >
                Filtrar
              </button>
            </div>
          </form>
        </div>
        <div className="w-full max-w-[10rem] rounded-2xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-600 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">Seguimiento al instante</p>
          <p className="mt-2">
            Pulsa <span className="font-semibold">+</span> para registrar sin perder el hilo.
          </p>
          <ul className="mt-3 space-y-1 text-[11px] text-slate-500">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
              Asocia cada actividad al contacto u oportunidad en segundos.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
              Usa los filtros por tipo y fecha para mantener claridad.
            </li>
          </ul>
        </div>
      </header>

      <section className="space-y-4">
        <header>
          <h3 className="text-lg font-semibold text-slate-900">
            Actividades recientes ({total.toLocaleString()})
          </h3>
          <p className="text-sm text-slate-500">
            Filtra por tipo y rango de fechas para revisar el trabajo del equipo de 500 personas.
          </p>
        </header>
        <ul className="space-y-4">
          {!hasResults ? (
            <li className="rounded-3xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
              No hay actividades que coincidan con el filtro.
            </li>
          ) : (
            activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                contacts={contactOptions}
                opportunities={opportunityOptions}
                teamMembers={teamOptions}
              />
            ))
          )}
        </ul>
      </section>

      <nav className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Mostrando {from.toLocaleString()}–{to.toLocaleString()} de {total.toLocaleString()} actividades
        </p>
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
            Página {currentPage} de {totalPages}
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
      </nav>
    </div>
  );
}
