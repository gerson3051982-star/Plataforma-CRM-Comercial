import Link from "next/link";
import { notFound } from "next/navigation";
import { getActivityById } from "@/lib/data";
import { formatDate, translateActivityStatus, translateActivityType } from "@/lib/utils";

export default async function ActivityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    notFound();
  }

  const activity = await getActivityById(id);

  if (!activity) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Detalle de actividad</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{activity.subject}</h1>
        </div>
        <Link
          href="/activities"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
        >
          ← Volver al registro
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Tipo</dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">
                {translateActivityType(activity.type)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Estado</dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">
                {translateActivityStatus(activity.status)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Programada</dt>
              <dd className="mt-1">{formatDate(activity.scheduledFor)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Fecha límite</dt>
              <dd className="mt-1">{formatDate(activity.dueDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Registrada</dt>
              <dd className="mt-1">{formatDate(activity.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Equipo</dt>
              <dd className="mt-1">{activity.teamMember?.name ?? "Sin responsable"}</dd>
            </div>
          </dl>

          {activity.notes ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Notas</h2>
              <p className="mt-2 whitespace-pre-line">{activity.notes}</p>
            </div>
          ) : null}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Contacto</p>
            <p className="mt-1 font-semibold text-slate-900">
              {activity.contact
                ? `${activity.contact.firstName} ${activity.contact.lastName}`
                : "Sin contacto asociado"}
            </p>
            {activity.contact?.email ? (
              <p className="mt-1 break-all text-xs text-slate-500">{activity.contact.email}</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Oportunidad</p>
            {activity.opportunity ? (
              <div className="mt-1 space-y-1">
                <p className="font-semibold text-slate-900">{activity.opportunity.title}</p>
                <p className="text-xs text-slate-500">Estado: {activity.opportunity.status}</p>
              </div>
            ) : (
              <p className="mt-1 text-slate-500">Sin oportunidad vinculada</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
