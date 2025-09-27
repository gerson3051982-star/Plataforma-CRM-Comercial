"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { updateProfileAction } from "@/actions/auth";
import { initialActionState } from "@/actions/types";
import { SubmitButton } from "@/components/form/submit-button";

type UpdateProfileFormProps = {
  action: typeof updateProfileAction;
  defaultValues: {
    name: string | null;
    email: string;
    role?: string | null;
  };
};

export function UpdateProfileForm({ action, defaultValues }: UpdateProfileFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  const messageVariant = state.status === "success" ? "text-emerald-600" : "text-rose-600";

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-6 shadow-sm">
      <div>
        <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor="name">
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultValues.name ?? ""}
          className="mt-1 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-strong)] shadow-sm focus:border-[var(--accent-400)] focus:outline-none"
          placeholder="Ana Martínez"
        />
        {state.fieldErrors?.name ? (
          <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.name}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          name="email"
          value={defaultValues.email}
          readOnly
          className="mt-1 w-full cursor-not-allowed rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-muted)] shadow-sm"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor="role">
          Rol en el equipo
        </label>
        <input
          id="role"
          name="role"
          defaultValue={defaultValues.role ?? ""}
          className="mt-1 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-strong)] shadow-sm focus:border-[var(--accent-400)] focus:outline-none"
          placeholder="Ejecutivo comercial"
        />
        {state.fieldErrors?.role ? (
          <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.role}</p>
        ) : null}
      </div>

      {state.message ? (
        <p className={`text-sm font-medium ${messageVariant}`}>{state.message}</p>
      ) : null}

      <SubmitButton label="Guardar cambios" pendingLabel="Guardando..." />
    </form>
  );
}
