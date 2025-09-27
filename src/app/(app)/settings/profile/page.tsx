import { redirect } from "next/navigation";
import { UpdateProfileForm } from "@/components/auth/update-profile-form";
import { updateProfileAction } from "@/actions/auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfileSettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--text-strong)]">Perfil</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Actualiza la información que se muestra al resto del equipo.
        </p>
      </header>
      <UpdateProfileForm action={updateProfileAction} defaultValues={user} />
    </section>
  );
}
