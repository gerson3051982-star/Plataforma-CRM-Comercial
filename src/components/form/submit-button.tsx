"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
};

const styles: Record<Required<SubmitButtonProps>["variant"], string> = {
  primary:
    "bg-slate-900 text-white shadow-sm shadow-slate-900/20 hover:bg-slate-800 disabled:bg-slate-400",
  secondary:
    "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 disabled:text-slate-400",
  danger: "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-400",
};

export function SubmitButton({ label, pendingLabel, variant = "primary" }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {pending ? pendingLabel ?? "Guardando..." : label}
    </button>
  );
}
