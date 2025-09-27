"use client";

import { useActionState, useEffect, useRef } from "react";
import type { changePasswordAction } from "@/actions/auth";
import { initialActionState } from "@/actions/types";
import { SubmitButton } from "@/components/form/submit-button";

type ChangePasswordFormProps = {
  action: typeof changePasswordAction;
};

export function ChangePasswordForm({ action }: ChangePasswordFormProps) {
  const [state, formAction] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  const messageVariant = state.status === "success" ? "text-emerald-600" : "text-rose-600";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-6 shadow-sm"
    >
      <div>
        <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor="currentPassword">
          Contraseña actual
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-strong)] shadow-sm focus:border-[var(--accent-400)] focus:outline-none"
          placeholder="********"
        />
        {state.fieldErrors?.currentPassword ? (
          <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.currentPassword}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor="newPassword">
          Nueva contraseña
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          className="mt-1 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-strong)] shadow-sm focus:border-[var(--accent-400)] focus:outline-none"
          placeholder="********"
        />
        {state.fieldErrors?.newPassword ? (
          <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.newPassword}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor="confirmPassword">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="mt-1 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-strong)] shadow-sm focus:border-[var(--accent-400)] focus:outline-none"
          placeholder="********"
        />
        {state.fieldErrors?.confirmPassword ? (
          <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.confirmPassword}</p>
        ) : null}
      </div>

      {state.message ? (
        <p className={`text-sm font-medium ${messageVariant}`}>{state.message}</p>
      ) : null}

      <SubmitButton label="Actualizar contraseña" pendingLabel="Guardando..." />
    </form>
  );
}
