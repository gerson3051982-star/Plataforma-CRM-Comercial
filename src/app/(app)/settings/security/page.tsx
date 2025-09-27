import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { changePasswordAction } from "@/actions/auth";
import { auth } from "@/lib/auth";

export default async function SecuritySettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--text-strong)]">Seguridad</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Cambia tu contraseña para mantener tu cuenta protegida.
        </p>
      </header>
      <ChangePasswordForm action={changePasswordAction} />
    </section>
  );
}
