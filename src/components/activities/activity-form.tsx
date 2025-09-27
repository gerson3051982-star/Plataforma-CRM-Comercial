"use client";

import { useEffect, useActionState } from "react";
import type { saveActivityAction } from "@/actions/activities";
import { initialActionState } from "@/actions/types";
import { SubmitButton } from "@/components/form/submit-button";

const types = [
  { value: "CALL", label: "Llamada" },
  { value: "EMAIL", label: "Correo" },
  { value: "MEETING", label: "Reunión" },
  { value: "TASK", label: "Tarea" },
] as const;

const statuses = [
  { value: "PLANNED", label: "Planificada" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
] as const;

type Option = {
  id: number;
  label: string;
};

type ActivityFormValues = {
  id?: number;
  type?: string;
  status?: string;
  subject?: string;
  notes?: string | null;
  scheduledFor?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  contactId?: number | null;
  opportunityId?: number | null;
  teamMemberId?: number | null;
};

type ActivityFormProps = {
  action: typeof saveActivityAction;
  contacts: Option[];
  opportunities: Option[];
  teamMembers: Option[];
  defaultValues?: ActivityFormValues;
  inline?: boolean;
  onSuccess?: () => void;
};

export function ActivityForm({
  action,
  contacts,
  opportunities,
  teamMembers,
  defaultValues,
  inline = false,
  onSuccess,
}: ActivityFormProps) {
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
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="type">
            Tipo
          </label>
          <select
            id="type"
            name="type"
            defaultValue={defaultValues?.type ?? "CALL"}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            {types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
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
            defaultValue={defaultValues?.status ?? "PLANNED"}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="teamMemberId">
            Registrada por
          </label>
          <select
            id="teamMemberId"
            name="teamMemberId"
            defaultValue={defaultValues?.teamMemberId ?? undefined}
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
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="subject">
          Asunto
        </label>
        <input
          id="subject"
          name="subject"
          defaultValue={defaultValues?.subject ?? ""}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="Llamada de actualización"
        />
        {state.fieldErrors?.subject ? (
          <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.subject}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="scheduledFor">
            Fecha agendada
          </label>
          <input
            id="scheduledFor"
            name="scheduledFor"
            type="datetime-local"
            defaultValue={defaultValues?.scheduledFor ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="dueDate">
            Fecha límite
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="datetime-local"
            defaultValue={defaultValues?.dueDate ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="completedAt">
            Resolución
          </label>
          <input
            id="completedAt"
            name="completedAt"
            type="datetime-local"
            defaultValue={defaultValues?.completedAt ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="contactId">
            Contacto asociado
          </label>
          <select
            id="contactId"
            name="contactId"
            defaultValue={defaultValues?.contactId ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="">Sin contacto</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="opportunityId">
            Oportunidad asociada
          </label>
          <select
            id="opportunityId"
            name="opportunityId"
            defaultValue={defaultValues?.opportunityId ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="">Sin oportunidad</option>
            {opportunities.map((opportunity) => (
              <option key={opportunity.id} value={opportunity.id}>
                {opportunity.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="notes">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? undefined}
          className="mt-1 h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="Resultados, compromisos, próximos pasos"
        />
      </div>

      {state.status === "error" ? (
        <p className="text-sm font-medium text-rose-600">{state.message ?? "Ocurrió un error"}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm font-medium text-emerald-600">{state.message}</p>
      ) : null}

      <div className="flex justify-end">
        <SubmitButton label="Registrar actividad" pendingLabel="Guardando..." />
      </div>
    </form>
  );
}
