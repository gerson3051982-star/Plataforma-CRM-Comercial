"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { classNames } from "@/lib/utils";
import {
  HomeIcon,
  UsersIcon,
  Squares2X2Icon,
  PhoneArrowUpRightIcon,
} from "@heroicons/react/24/outline";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ThemeCustomizer } from "@/components/layout/theme-customizer";
import { QuickCreate } from "@/components/layout/quick-create";
import type { QuickCreateData } from "@/components/layout/quick-create";
import { ProfileMenu } from "@/components/layout/profile-menu";

const navigation = [
  { name: "Resumen", href: "/", icon: HomeIcon },
  { name: "Contactos", href: "/contacts", icon: UsersIcon },
  { name: "Oportunidades", href: "/opportunities", icon: Squares2X2Icon },
  { name: "Interacciones", href: "/activities", icon: PhoneArrowUpRightIcon },
];

type AppShellProps = {
  children: ReactNode;
  user: {
    name?: string | null;
    email: string;
    role?: string | null;
    image?: string | null;
    teamMemberId?: number | null;
  };
  quickCreate: QuickCreateData;
};

export function AppShell({ children, user, quickCreate }: AppShellProps) {
  const pathname = usePathname();
  const displayName = user.name ?? user.email;
  const displayRole = user.role ?? "Colaborador";
  const nameTokens = displayName
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const avatarInitials = nameTokens && nameTokens.length > 0
    ? nameTokens.map((token) => token[0]?.toUpperCase()).join("")
    : user.email.slice(0, 2).toUpperCase();

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-[var(--surface-app)] text-[var(--text-strong)]">
        <aside className="hidden flex-col border-r border-[var(--border-soft)] bg-[var(--surface-sidebar)] backdrop-blur lg:flex lg:w-56 xl:w-64">
          <div className="border-b border-[var(--border-soft)] px-5 py-[1.2125rem]">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-400)] to-[var(--accent-600)] text-[var(--accent-foreground)] font-semibold shadow-sm">
                CRM
              </span>
              <span className="text-lg font-semibold text-[var(--text-strong)]">
                Equipo Comercial
              </span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[var(--accent-100)] text-[var(--accent-700)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[var(--border-soft)] px-5 py-5 text-sm text-[var(--text-muted)]">
            <p className="font-medium text-[var(--text-strong)]">Capacitación</p>
            <p>Comparte notas, guías y materiales con tu equipo desde aquí.</p>
          </div>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--border-soft)] bg-[var(--surface-overlay)] backdrop-blur">
            <div className="flex w-full items-center justify-between gap-3 px-4 py-[0.38rem] sm:px-5 sm:py-[0.38rem]">
              <div className="space-y-1 sm:w-[20.125rem]">
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--text-muted)] opacity-80">Panel de clientes</p>
                <h1 className="text-lg font-semibold text-[var(--text-strong)] whitespace-nowrap">Controla el flujo comercial de punta a punta</h1>
              </div>
              <div className="hidden flex-1 justify-center sm:flex">
                <ThemeCustomizer />
              </div>
              <div className="hidden w-[14rem] items-center justify-end gap-4 text-sm sm:flex">
                <ProfileMenu
                  name={displayName ?? user.email}
                  email={user.email}
                  role={displayRole}
                  initials={avatarInitials}
                  image={user.image}
                  variant="desktop"
                />
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-[var(--text-muted)] sm:hidden">
                <ThemeCustomizer />
                <ProfileMenu
                  name={displayName ?? user.email}
                  email={user.email}
                  role={displayRole}
                  initials={avatarInitials}
                  image={user.image}
                  variant="mobile"
                />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:px-10">{children}</main>
        </div>
      </div>
      <QuickCreate data={quickCreate} />
    </ThemeProvider>
  );
}
