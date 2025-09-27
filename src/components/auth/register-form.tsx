"use client";

import { useEffect, useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUserAction } from "@/actions/auth";
import { initialActionState } from "@/actions/types";
import { SubmitButton } from "@/components/form/submit-button";

const roles = [
  "Ejecutivo comercial",
  "Ventas",
  "Marketing",
  "Soporte",
  "Lider",
];

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(registerUserAction, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      const timeout = setTimeout(() => {
        router.push("/login?welcome=1");
      }, 1500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [state.status, router]);

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-slate-200 bg-white/80 px-6 py-8 shadow-sm backdrop-blur">
      <div className="space-y-2 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
          CRM
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Crear cuenta</h1>
          <p className="text-sm text-slate-500">Únete al panel para gestionar relaciones con tus clientes.</p>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-semibold text-slate-700">
          Nombre y apellidos
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="Laura Gómez"
        />
        {state.fieldErrors?.name ? (
          <p className="text-xs text-rose-500">{state.fieldErrors.name}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
          Correo corporativo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="laura@empresa.com"
        />
        {state.fieldErrors?.email ? (
          <p className="text-xs text-rose-500">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="text-sm font-semibold text-slate-700">
          Rol en el equipo (opcional)
        </label>
        <select
          id="role"
          name="role"
          defaultValue=""
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
        >
          <option value="">Selecciona tu rol</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        {state.fieldErrors?.role ? (
          <p className="text-xs text-rose-500">{state.fieldErrors.role}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="********"
        />
        {state.fieldErrors?.password ? (
          <p className="text-xs text-rose-500">{state.fieldErrors.password}</p>
        ) : (
          <p className="text-xs text-slate-400">Debe incluir mayúsculas, minúsculas y números.</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="********"
        />
        {state.fieldErrors?.confirmPassword ? (
          <p className="text-xs text-rose-500">{state.fieldErrors.confirmPassword}</p>
        ) : null}
      </div>

      {state.status === "error" ? (
        <p className="text-sm font-medium text-rose-600">{state.message ?? "No pudimos crear tu cuenta"}</p>
      ) : null}

      {state.status === "success" ? (
        <p className="text-sm font-medium text-emerald-600">{state.message}</p>
      ) : null}

      <SubmitButton label="Crear cuenta" pendingLabel="Creando..." />

      <p className="text-center text-xs text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-slate-700 hover:text-slate-900">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
