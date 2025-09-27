"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  KeyIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/lib/utils";

type ProfileMenuProps = {
  name: string;
  email: string;
  role: string;
  initials: string;
  image?: string | null;
  variant?: "desktop" | "mobile";
};

export function ProfileMenu({
  name,
  email,
  role,
  initials,
  image,
  variant = "desktop",
}: ProfileMenuProps) {
  const router = useRouter();

  const buttonClasses =
    variant === "desktop"
      ? "flex items-center gap-3 rounded-full border border-[var(--border-soft)] px-3 py-[0.28rem] text-sm transition hover:border-[var(--accent-400)]"
      : "inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] px-3 py-[0.18rem] text-xs font-semibold transition hover:border-[var(--accent-400)]";

  const textClasses = variant === "desktop" ? "text-xs" : "text-[10px]";

  return (
    <Menu as="div" className="relative">
      <Menu.Button className={buttonClasses}>
        <div className="flex h-[2.44rem] w-[2.44rem] items-center justify-center overflow-hidden rounded-full bg-[var(--accent-600)] text-[1.02rem] font-semibold uppercase text-[var(--accent-foreground)]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name ?? "Perfil"} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        {variant === "desktop" ? (
          <div className="flex flex-col items-start">
            <span className="font-semibold text-[var(--text-strong)]">{name}</span>
            <span className={`${textClasses} text-[var(--text-muted)]`}>{role}</span>
          </div>
        ) : (
          <span className="font-semibold text-[var(--text-strong)]">{name}</span>
        )}
        <ChevronDownIcon className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-30 mt-2 w-64 origin-top-right rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-overlay)] p-2 shadow-xl focus:outline-none">
          <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-2">
            <p className="text-sm font-semibold text-[var(--text-strong)]">{name}</p>
            <p className="text-xs text-[var(--text-muted)]">{email}</p>
            <p className="text-xs text-[var(--text-muted)]">{role}</p>
          </div>

          <div className="mt-2 space-y-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => router.push("/settings/profile")}
                  className={classNames(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium",
                    active
                      ? "bg-[var(--surface-hover)] text-[var(--text-strong)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-strong)]"
                  )}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  Editar usuario
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => router.push("/settings/security")}
                  className={classNames(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium",
                    active
                      ? "bg-[var(--surface-hover)] text-[var(--text-strong)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-strong)]"
                  )}
                >
                  <KeyIcon className="h-5 w-5" />
                  Cambiar contraseña
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className={classNames(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium",
                    active
                      ? "bg-rose-50 text-rose-600"
                      : "text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  )}
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  Cerrar sesión
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
