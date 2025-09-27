"use client";

import { useEffect, useActionState } from "react";
import type { saveContactAction } from "@/actions/contacts";
import { initialActionState } from "@/actions/types";
import { SubmitButton } from "@/components/form/submit-button";

type TeamMemberOption = {
  id: number;
  name: string;
};

type TagOption = {
  id: number;
  name: string;
  color: string | null;
};

export type ContactFormValues = {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  companyCity?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  notes?: string | null;
  tags?: string[];
  ownerId?: number | null;
};

type ContactFormProps = {
  action: typeof saveContactAction;
  defaultValues?: ContactFormValues;
  teamMembers: TeamMemberOption[];
  tagsOptions: TagOption[];
  inline?: boolean;
  onSuccess?: () => void;
};

export function ContactForm({
  action,
  defaultValues,
  teamMembers,
  tagsOptions,
  inline = false,
  onSuccess,
}: ContactFormProps) {
  const [state, formAction] = useActionState(action, initialActionState);

  useEffect(() => {
    if (state.status === "success" && onSuccess) {
      onSuccess();
    }
  }, [state.status, onSuccess]);

  return (
    <form
      action={formAction}
      className={`space-y-5 ${inline ? "" : "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"}`}
    >
      {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="firstName">
            Nombre
          </label>
          <input
            id="firstName"
            name="firstName"
            defaultValue={defaultValues?.firstName}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="Ana"
            required
          />
          {state.fieldErrors?.firstName ? (
            <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.firstName}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="lastName">
            Apellido
          </label>
          <input
            id="lastName"
            name="lastName"
            defaultValue={defaultValues?.lastName}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="Martínez"
            required
          />
          {state.fieldErrors?.lastName ? (
            <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.lastName}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            type="email"
            name="email"
            defaultValue={defaultValues?.email ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="ana@empresa.com"
          />
          {state.fieldErrors?.email ? (
            <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.email}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="phone">
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={defaultValues?.phone ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="+52 55 1234 5678"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="jobTitle">
            Cargo
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            defaultValue={defaultValues?.jobTitle ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="Directora de Compras"
          />
        </div>
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
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="companyName">
            Empresa
          </label>
          <input
            id="companyName"
            name="companyName"
            defaultValue={defaultValues?.companyName ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="Comercial XYZ"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="companyCity">
            Ciudad de la empresa
          </label>
          <input
            id="companyCity"
            name="companyCity"
            defaultValue={defaultValues?.companyCity ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="Madrid"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="city">
            Ciudad del contacto
          </label>
          <input
            id="city"
            name="city"
            defaultValue={defaultValues?.city ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="Valencia"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="country">
            País
          </label>
          <input
            id="country"
            name="country"
            defaultValue={defaultValues?.country ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="España"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="notes">
          Notas y contexto
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? undefined}
          className="mt-1 h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="Preferencias, decisiones clave, próximos pasos..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700" htmlFor="tagsCSV">
            Etiquetas (separadas por coma)
          </label>
          <div className="flex flex-wrap gap-1 text-xs text-slate-400">
            {tagsOptions.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                style={{ backgroundColor: tag.color ?? "#e2e8f0" }}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-900"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        <input
          id="tagsCSV"
          name="tagsCSV"
          defaultValue={defaultValues?.tags?.join(", ") ?? ""}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="VIP, Demo pendiente, Upsell"
        />
      </div>

      {state.status === "error" ? (
        <p className="text-sm font-medium text-rose-600">{state.message ?? "Ocurrió un error"}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm font-medium text-emerald-600">{state.message}</p>
      ) : null}

      <div className="flex items-center justify-end">
        <SubmitButton label={defaultValues?.id ? "Actualizar contacto" : "Crear contacto"} pendingLabel="Guardando..." />
      </div>
    </form>
  );
}
