"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams?.get("welcome") === "1";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-6 rounded-3xl border border-slate-200 bg-white/80 px-6 py-8 shadow-sm backdrop-blur"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email")?.toString().trim() ?? "";
        const password = formData.get("password")?.toString() ?? "";

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Credenciales inválidas. Verifica tu correo y contraseña.");
          setLoading(false);
          return;
        }

        router.replace("/");
        router.refresh();
      }}
    >
      <div className="space-y-2 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
          CRM
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Inicia sesión</h1>
          <p className="text-sm text-slate-500">Gestiona contactos, pipeline y actividades de tu equipo.</p>
        </div>
      </div>

      {registered ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Cuenta creada. Ingresa con tus credenciales.
        </div>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="tu@empresa.com"
        />
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
      </div>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      <p className="text-center text-xs text-slate-500">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-slate-700 hover:text-slate-900">
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
}
