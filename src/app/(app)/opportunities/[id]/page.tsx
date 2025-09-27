import Link from "next/link";
import { notFound } from "next/navigation";
import { getOpportunityById } from "@/lib/data";
import { formatCurrency, formatDate, translateActivityType } from "@/lib/utils";

export default async function OpportunityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    notFound();
  }

  const opportunity = await getOpportunityById(id);

  if (!opportunity) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Detalle de oportunidad</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{opportunity.title}</h1>
        </div>
        <Link
          href="/opportunities"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
        >
          ← Volver al pipeline
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Valor estimado</dt>
              <dd className="mt-1 text-xl font-semibold text-slate-900">
                {formatCurrency(opportunity.value ? Number(opportunity.value) : 0)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Estado</dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">{opportunity.status}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Cierre estimado</dt>
              <dd className="mt-1">{formatDate(opportunity.estimatedCloseDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Responsable</dt>
              <dd className="mt-1">{opportunity.owner?.name ?? "Sin asignar"}</dd>
            </div>
          </dl>

          {opportunity.description ? (
            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Descripción</h2>
              <p className="whitespace-pre-line">{opportunity.description}</p>
            </div>
          ) : null}

          <div className="mt-6 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Últimas actividades</h2>
            {opportunity.activities.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                No se han registrado actividades aún.
              </p>
            ) : (
              <ul className="space-y-3 text-sm text-slate-600">
                {opportunity.activities.map((activity) => (
                  <li key={activity.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="font-semibold text-slate-900">{activity.subject}</p>
                    <p className="text-xs text-slate-500">
                      {translateActivityType(activity.type)} · {formatDate(activity.dueDate ?? activity.createdAt)}
                    </p>
                    {activity.teamMember ? (
                      <p className="text-xs text-slate-400">Registró: {activity.teamMember.name}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Empresa</p>
            <p className="mt-1 font-semibold text-slate-900">{opportunity.company?.name ?? "Sin empresa"}</p>
            {opportunity.company?.city ? (
              <p className="text-xs text-slate-500">{opportunity.company.city}</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Contacto</p>
            <p className="mt-1 font-semibold text-slate-900">
              {opportunity.contact
                ? `${opportunity.contact.firstName} ${opportunity.contact.lastName}`
                : "Sin contacto asignado"}
            </p>
            {opportunity.contact?.email ? (
              <p className="text-xs text-slate-500">{opportunity.contact.email}</p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
