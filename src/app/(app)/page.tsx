import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";
import { getDashboardMetrics, listOpportunities } from "@/lib/data";
import { auth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Sesión no válida");
  }
  const currentUser = session.user as Session["user"] & { teamMemberId?: number | null; role?: string | null };
  const isAdmin = currentUser.role === "admin";
  const teamMemberId = isAdmin ? undefined : currentUser.teamMemberId ?? undefined;

  const [{ contactCount, activityCount, pipelineTotals, upcomingActivities }, { pipeline }] = await Promise.all([
    getDashboardMetrics(teamMemberId),
    listOpportunities({ page: 1, pageSize: 4, teamMemberId }),
  ]);

  const totalPipeline =
    (pipelineTotals.NEW.value ?? 0) +
    (pipelineTotals.IN_PROGRESS.value ?? 0) +
    (pipelineTotals.WON.value ?? 0);

  const latestNew = pipeline.NEW;

  const upcomingStyles: Record<
    (typeof upcomingActivities)[number]["type"],
    {
      card: string;
      label: string;
      detail: string;
    }
  > = {
    CALL: {
      card: "border-sky-100 bg-sky-50 hover:border-sky-200",
      label: "text-sky-600",
      detail: "border-sky-100 text-sky-500 group-hover:border-sky-200 group-hover:text-sky-700",
    },
    EMAIL: {
      card: "border-indigo-100 bg-indigo-50 hover:border-indigo-200",
      label: "text-indigo-600",
      detail: "border-indigo-100 text-indigo-500 group-hover:border-indigo-200 group-hover:text-indigo-700",
    },
    MEETING: {
      card: "border-amber-100 bg-amber-50 hover:border-amber-200",
      label: "text-amber-600",
      detail: "border-amber-100 text-amber-500 group-hover:border-amber-200 group-hover:text-amber-700",
    },
    TASK: {
      card: "border-emerald-100 bg-emerald-50 hover:border-emerald-200",
      label: "text-emerald-600",
      detail: "border-emerald-100 text-emerald-500 group-hover:border-emerald-200 group-hover:text-emerald-700",
    },
  };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface-card)] shadow-xl shadow-[rgba(15,23,42,0.08)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--hero-from)] via-transparent to-[var(--hero-to)]" />
        <Image
          src="/hero-grid.svg"
          alt="Clientes felices"
          fill
          className="pointer-events-none object-cover opacity-25 mix-blend-luminosity scale-[1.15]"
          priority
        />
        <div className="relative flex flex-col gap-10 px-8 py-10 md:px-12 lg:px-16">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-100)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-700)]">
              Nuevo flujo comercial
            </span>
            <h2 className="text-3xl font-bold text-[var(--text-strong)] sm:text-4xl">
              Visualiza cada relación y acelera cierres ganados
            </h2>
            <p className="max-w-2xl text-base text-[var(--text-muted)]">
              500 personas colaboran con transparencia en un único lugar. Los contactos, oportunidades y actividades
              están sincronizados para que ningún seguimiento se pierda.
            </p>
            <div className="relative mt-8 grid gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card-glass)] p-6 shadow-sm backdrop-blur sm:grid-cols-3">
              <Link
                href="/contacts"
                className="rounded-2xl border border-[var(--accent-100)] bg-[var(--accent-50)] px-4 py-5 text-left shadow-sm transition hover:border-[var(--accent-300)] hover:shadow-md"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-600)]">Contactos activos</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--accent-700)]">{contactCount.toLocaleString()}</p>
              </Link>
              <Link
                href="/activities"
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-hover)] px-4 py-5 text-left shadow-sm transition hover:border-[var(--accent-200)] hover:shadow-md"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Interacciones</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">{activityCount.toLocaleString()}</p>
              </Link>
              <Link
                href="/opportunities"
                className="rounded-2xl bg-[var(--accent-600)] px-4 py-5 text-left text-[var(--accent-foreground)] shadow-sm transition hover:bg-[var(--accent-700)]"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-foreground)]/80">Valor del pipeline</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalPipeline)}</p>
              </Link>
            </div>
            <div className="relative mt-6 space-y-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card-glass)] p-6 shadow-sm backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Próximos 7 días</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Actividades programadas para los siguientes toques comerciales.
                </p>
              </div>
              <ul className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {upcomingActivities.length === 0 && (
                  <li className="rounded-xl border border-dashed border-[var(--border-soft)] px-3 py-3 text-[var(--text-muted)]">
                    No hay actividades próximas. ¡Programa el siguiente toque!
                  </li>
                )}
                {upcomingActivities.map((activity) => {
                  const style = upcomingStyles[activity.type] ?? upcomingStyles.CALL;
                  return (
                    <li key={activity.id} className="h-full">
                      <Link
                        href={`/activities/${activity.id}`}
                        className={`group flex h-full flex-col justify-between gap-3 rounded-xl border bg-[var(--surface-card)] p-3 text-left text-[var(--text-strong)] shadow-sm transition hover:shadow-md ${style.card}`}
                      >
                        <div className="space-y-2">
                          <p className={`text-[10px] font-semibold uppercase tracking-[0.32em] ${style.label}`}>
                            {activity.type === "CALL"
                              ? "Llamada"
                              : activity.type === "EMAIL"
                                ? "Correo"
                                : activity.type === "MEETING"
                                  ? "Reunión"
                                  : "Tarea"}
                          </p>
                          <p className="text-sm font-semibold leading-snug transition group-hover:text-[var(--accent-700)] line-clamp-2">
                            {activity.subject}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {activity.contact
                              ? `${activity.contact.firstName} ${activity.contact.lastName}`
                              : activity.opportunity?.title ?? "Sin referencia"}
                          </p>
                        </div>
                        <div className="mt-auto flex items-end justify-between gap-3 text-[10px] text-[var(--text-muted)]">
                          <div className="space-y-1">
                            {activity.scheduledFor ? (
                              <p>
                                <span className="font-semibold text-[var(--text-strong)]">Agendada:</span>{" "}
                                {formatDate(activity.scheduledFor)}
                              </p>
                            ) : null}
                            {activity.dueDate ? (
                              <p>
                                <span className="font-semibold text-[var(--text-strong)]">Límite:</span>{" "}
                                {formatDate(activity.dueDate)}
                              </p>
                            ) : null}
                            {activity.completedAt ? (
                              <p>
                                <span className="font-semibold text-[var(--text-strong)]">Resuelta:</span>{" "}
                                {formatDate(activity.completedAt)}
                              </p>
                            ) : null}
                            {!activity.scheduledFor && !activity.dueDate && !activity.completedAt ? (
                              <p><span className="font-semibold text-[var(--text-strong)]">Sin fecha estimada</span></p>
                            ) : null}
                          </div>
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.28em] transition ${style.detail}`}>
                            Ver detalle
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            
          </div>
        </div>
        
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        {([
          {
            title: "Nuevas",
            status: "NEW",
            description: "Leads sin primer contacto",
            badgeClasses: "bg-[var(--accent-100)] text-[var(--accent-700)]",
          },
          {
            title: "En progreso",
            status: "IN_PROGRESS",
            description: "Negociaciones activas",
            badgeClasses: "bg-amber-100 text-amber-700",
          },
          {
            title: "Ganadas",
            status: "WON",
            description: "Cierres confirmados",
            badgeClasses: "bg-emerald-100 text-emerald-700",
          },
          {
            title: "Perdidas",
            status: "LOST",
            description: "Oportunidades a recuperar",
            badgeClasses: "bg-rose-100 text-rose-700",
          },
        ] as const).map((item) => (
          <article key={item.status} className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-6 shadow-sm">
            <p className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${item.badgeClasses}`}>
              {item.title}
            </p>
            <p className="mt-4 text-3xl font-semibold text-[var(--text-strong)]">
              {pipelineTotals[item.status].count.toLocaleString()} registros
            </p>
            <p className="text-sm text-[var(--text-muted)]">{item.description}</p>
            <p className="mt-4 text-sm font-semibold text-[var(--text-strong)]">
              {formatCurrency(pipelineTotals[item.status].value ?? 0)}
            </p>
            <Link
              href="/opportunities"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-700)] transition hover:text-[var(--accent-600)]"
            >
              Ver detalle →
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-strong)]">Oportunidades nuevas destacadas</h3>
            <p className="text-sm text-[var(--text-muted)]">Seguimiento rápido para mantener el ritmo del pipeline.</p>
          </div>
          <Link
            href="/opportunities"
            className="rounded-full border border-[var(--border-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent-400)] hover:text-[var(--accent-700)]"
          >
            Ir al pipeline
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {latestNew.map((opportunity) => (
            <Link
              key={opportunity.id}
              href={`/opportunities/${opportunity.id}`}
              className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-4 text-left shadow-sm transition hover:border-[var(--accent-300)] hover:shadow-md"
            >
              <p className="text-sm font-semibold text-[var(--text-strong)]">{opportunity.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[var(--text-muted)] opacity-75">
                {opportunity.company?.name ?? "Sin empresa"}
              </p>
              <p className="mt-4 text-lg font-semibold text-[var(--accent-700)]">
                {formatCurrency(opportunity.value ? Number(opportunity.value) : 0)}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>
                  {opportunity.contact
                    ? `${opportunity.contact.firstName} ${opportunity.contact.lastName}`
                    : "Contacto por asignar"}
                </span>
                <span>{formatDate(opportunity.estimatedCloseDate)}</span>
              </div>
            </Link>
          ))}
          {latestNew.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-[var(--border-soft)] p-6 text-center text-[var(--text-muted)]">
              No hay oportunidades registradas aún. Crea la primera desde el pipeline.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
