"use client";

import { useEffect, useActionState } from "react";
import type { saveOpportunityAction } from "@/actions/opportunities";
import { initialActionState } from "@/actions/types";
import { SubmitButton } from "@/components/form/submit-button";

const statuses = [
  { value: "NEW", label: "Nueva" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "WON", label: "Ganada" },
  { value: "LOST", label: "Perdida" },
] as const;

type Option = {
  id: number;
  label: string;
};

type OpportunityFormValues = {
  id?: number;
  title?: string;
  description?: string | null;
  value?: string | number | null;
  status?: string;
  estimatedCloseDate?: string | null;
  companyId?: number | null;
  contactId?: number | null;
  ownerId?: number | null;
};

type OpportunityFormProps = {
  action: typeof saveOpportunityAction;
  defaultValues?: OpportunityFormValues;
  companies: Option[];
  contacts: Option[];
  teamMembers: Option[];
  inline?: boolean;
  onSuccess?: () => void;
};

export function OpportunityForm({
  action,
  defaultValues,
  companies,
  contacts,
  teamMembers,
  inline = false,
  onSuccess,
}: OpportunityFormProps) {
  const [state, formAction] = useActionState(action, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
  }, [state.status, onSuccess]);

  return (
    <form
      action={formAction}
      className={`space-y-5 ${inline ? "" : "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"}`}
    >
      {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="title">
          Título de la oportunidad
        </label>
        <input
          id="title"
          name="title"
          defaultValue={defaultValues?.title ?? ""}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="Implementación CRM en Grupo Sempra"
        />
        {state.fieldErrors?.title ? (
          <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.title}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="value">
            Valor estimado
          </label>
          <input
            id="value"
            name="value"
            defaultValue={defaultValues?.value ?? ""}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="150000"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="estimatedCloseDate">
            Cierre estimado
          </label>
          <input
            id="estimatedCloseDate"
            name="estimatedCloseDate"
            type="date"
            defaultValue={defaultValues?.estimatedCloseDate ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="companyId">
            Empresa vinculada
          </label>
          <select
            id="companyId"
            name="companyId"
            defaultValue={defaultValues?.companyId ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="">Sin empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="contactId">
            Contacto principal
          </label>
          <select
            id="contactId"
            name="contactId"
            defaultValue={defaultValues?.contactId ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="">Por asignar</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="ownerId">
            Responsable
          </label>
          <select
            id="ownerId"
            name="ownerId"
            defaultValue={defaultValues?.ownerId ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="">Sin asignar</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="status">
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "NEW"}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="description">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description ?? undefined}
          className="mt-1 h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="Notas clave, actores involucrados, próximos pasos"
        />
      </div>

      {state.status === "error" ? (
        <p className="text-sm font-medium text-rose-600">{state.message ?? "Ocurrió un error"}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm font-medium text-emerald-600">{state.message}</p>
      ) : null}

      <div className="flex justify-end">
        <SubmitButton
          label={defaultValues?.id ? "Actualizar oportunidad" : "Crear oportunidad"}
          pendingLabel="Guardando..."
        />
      </div>
    </form>
  );
}
