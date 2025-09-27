import Link from "next/link";
import { ContactCard } from "@/components/contacts/contact-card";
import { ContactFilters } from "@/components/contacts/contact-filters";
import { listContacts, listTags, listTeamMembers } from "@/lib/data";

const groupOptions = [
  { value: "none", label: "Sin agrupación" },
  { value: "city", label: "Por ciudad" },
  { value: "company", label: "Por empresa" },
  { value: "tag", label: "Por etiqueta" },
] as const;

type RawSearchParams = Record<string, string | string[] | undefined>;

type ContactsPageProps = {
  searchParams?: Promise<RawSearchParams> | RawSearchParams;
};

function parsePage(searchParams: RawSearchParams) {
  const raw = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildPageHref(
  searchParams: RawSearchParams,
  page: number,
) {
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

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const resolvedSearchParams = ((await Promise.resolve(searchParams)) ?? {}) as RawSearchParams;
  const page = parsePage(resolvedSearchParams);
  const [{ contacts, groups, groupBy, query, pagination }, tags, team] = await Promise.all([
    listContacts(resolvedSearchParams, { page, pageSize: 15 }),
    listTags(),
    listTeamMembers(),
  ]);

  const { total, pageSize, totalPages, page: currentPage } = pagination;
  const hasResults = contacts.length > 0;
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
              <h2 className="text-2xl font-semibold text-slate-900">
                Contactos ({total.toLocaleString()})
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Escala tu base de 5,000 clientes con búsquedas avanzadas y etiquetas personalizadas.
              </p>
            </div>
            <p className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Página {currentPage} de {totalPages}
            </p>
          </div>
          <ContactFilters
            groupOptions={groupOptions}
            initialQuery={query ?? ""}
            initialGroupBy={groupBy}
          />
        </div>
        <div className="w-full max-w-[10rem] rounded-2xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-600 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">¿Agregar algo rápido?</p>
          <p className="mt-2">
            Pulsa <span className="font-semibold">+</span> para registrar sin dejar esta vista.
          </p>
          <ul className="mt-3 space-y-1 text-[11px] text-slate-500">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
              Formularios ligeros listos para completar.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
              Captura información sin perder el contexto del tablero.
            </li>
          </ul>
        </div>
      </header>

      <section className="space-y-8">
        {!hasResults ? (
          <p className="rounded-3xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
            No se encontraron contactos con el filtro actual.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.key} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{group.label}</h3>
                <p className="text-sm text-slate-500">
                  {group.contacts.length} contacto{group.contacts.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.contacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} teamMembers={team} tagsOptions={tags} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <nav className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Mostrando {from.toLocaleString()}–{to.toLocaleString()} de {total.toLocaleString()} contactos
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
