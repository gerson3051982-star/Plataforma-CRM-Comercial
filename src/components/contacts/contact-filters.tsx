"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type GroupOption = {
  value: string;
  label: string;
};

type ContactFiltersProps = {
  groupOptions: readonly GroupOption[];
  initialQuery: string;
  initialGroupBy: string;
};

const SEARCH_DEBOUNCE_MS = 400;

export function ContactFilters({ groupOptions, initialQuery, initialGroupBy }: ContactFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const lastAppliedQuery = useRef(initialQuery);

  useEffect(() => {
    const currentParam = searchParams.get("query") ?? "";
    lastAppliedQuery.current = currentParam;
    setQuery((previous) => (previous === currentParam ? previous : currentParam));
  }, [searchParams]);

  useEffect(() => {
    if (query === lastAppliedQuery.current) {
      return;
    }

    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("query", query);
      } else {
        params.delete("query");
      }
      params.delete("page");

      const queryString = params.toString();
      lastAppliedQuery.current = query;
      startTransition(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(handle);
    };
  }, [query, pathname, router, searchParams, startTransition]);

  return (
    <form method="get" className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_auto]">
      <input type="hidden" name="page" value="1" />
      <input
        name="query"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nombre, empresa, etiqueta..."
        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
      />
      <select
        name="groupBy"
        defaultValue={initialGroupBy}
        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
      >
        {groupOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-xl bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/20"
      >
        Aplicar
      </button>
    </form>
  );
}
