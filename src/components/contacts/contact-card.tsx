"use client";

import { Fragment, useCallback, useState } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { CONTACT_STATUS_COLORS } from "@/components/contacts/constants";
import { ContactForm, type ContactFormValues } from "@/components/contacts/contact-form";
import { deleteContactAction, saveContactAction } from "@/actions/contacts";
import { SubmitButton } from "@/components/form/submit-button";
import { initials, translateActivityType } from "@/lib/utils";
import type { ContactWithRelations } from "@/lib/data";

const paletteFallback = CONTACT_STATUS_COLORS;

type TeamMemberOption = {
  id: number;
  name: string;
};

type TagOption = {
  id: number;
  name: string;
  color: string | null;
};

type ContactCardProps = {
  contact: ContactWithRelations;
  teamMembers: TeamMemberOption[];
  tagsOptions: TagOption[];
};

export function ContactCard({ contact, teamMembers, tagsOptions }: ContactCardProps) {
  const [open, setOpen] = useState(false);

  const defaultValues: ContactFormValues = {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    jobTitle: contact.jobTitle,
    companyName: contact.company?.name ?? undefined,
    companyCity: contact.company?.city ?? undefined,
    city: contact.city ?? undefined,
    country: contact.country ?? undefined,
    notes: contact.notes ?? undefined,
    ownerId: contact.ownerId ?? undefined,
    tags: contact.tags.map((tag) => tag.tag.name),
  };

  const latestActivity = contact.activities[0];

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <article
        className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpen();
          }
        }}
        aria-label={`Ver y editar a ${contact.firstName} ${contact.lastName}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-900 text-white">
              <span className="flex h-full w-full items-center justify-center text-lg font-semibold">
                {initials(contact.firstName, contact.lastName)}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {contact.firstName} {contact.lastName}
              </p>
              <p className="text-sm text-slate-500">{contact.jobTitle ?? "Sin cargo"}</p>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                {contact.company?.name ?? "Sin empresa"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
              {contact.owner?.name ?? "Sin responsable"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition group-hover:border-slate-300 group-hover:text-slate-900">
              <PencilSquareIcon className="h-4 w-4" />
              Abrir
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-500">Contacto</p>
            <p className="break-all">{contact.email ?? "Sin correo"}</p>
            <p className="break-all">{contact.phone ?? "Sin teléfono"}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-500">Ubicación</p>
            <p>{contact.city ?? "Ciudad no registrada"}</p>
            <p>{contact.country ?? "País no registrado"}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-500">Etiquetas</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {contact.tags.length === 0 && <span className="text-xs text-slate-400">Sin etiquetas</span>}
              {contact.tags.map((tag, index) => (
                <span
                  key={tag.tag.id}
                  className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-800"
                  style={{ backgroundColor: tag.tag.color ?? paletteFallback[index % paletteFallback.length] }}
                >
                  {tag.tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
          {latestActivity ? (
            <p>
              Última actividad: <span className="font-semibold text-slate-700">{latestActivity.subject}</span> ({translateActivityType(latestActivity.type)})
            </p>
          ) : (
            <p>Sin actividades registradas aún.</p>
          )}
        </div>

        {contact.opportunities.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
            {contact.opportunities.map((opportunity) => (
              <Link
                key={opportunity.id}
                href="/opportunities"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                {opportunity.title}
              </Link>
            ))}
          </div>
        ) : null}
      </article>

      <Transition show={open} as={Fragment} appear>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <Transition.Child
                as={Fragment}
                enter="transition-all duration-200 ease-out"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="transition-all duration-150 ease-in"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-900 text-white">
                        <span className="flex h-full w-full items-center justify-center text-xl font-semibold">
                          {initials(contact.firstName, contact.lastName)}
                        </span>
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-semibold text-slate-900">
                          {contact.firstName} {contact.lastName}
                        </Dialog.Title>
                        <p className="text-sm text-slate-500">{contact.jobTitle ?? "Sin cargo"}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          {contact.company?.name ?? "Sin empresa"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                      aria-label="Cerrar"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_1fr]">
                    <section className="space-y-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                      <div className="space-y-3 text-sm text-slate-600">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Contacto</p>
                          <p className="mt-1 break-all text-slate-800">{contact.email ?? "Sin correo"}</p>
                          <p className="break-all">{contact.phone ?? "Sin teléfono"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Ubicación</p>
                          <p className="mt-1">{contact.city ?? "Ciudad no registrada"}</p>
                          <p>{contact.country ?? "País no registrado"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Responsable</p>
                          <p className="mt-1 font-semibold text-slate-700">{contact.owner?.name ?? "Sin responsable"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Etiquetas</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {contact.tags.length === 0 && <span className="text-xs text-slate-400">Sin etiquetas</span>}
                            {contact.tags.map((tag, index) => (
                              <span
                                key={tag.tag.id}
                                className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-800"
                                style={{ backgroundColor: tag.tag.color ?? paletteFallback[index % paletteFallback.length] }}
                              >
                                {tag.tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
                          {latestActivity ? (
                            <p>
                              Última actividad: <span className="font-semibold text-slate-700">{latestActivity.subject}</span> ({translateActivityType(latestActivity.type)})
                            </p>
                          ) : (
                            <p>Sin actividades registradas aún.</p>
                          )}
                        </div>
                        {contact.opportunities.length > 0 ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Oportunidades</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                              {contact.opportunities.map((opportunity) => (
                                <Link
                                  key={opportunity.id}
                                  href="/opportunities"
                                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleClose();
                                  }}
                                >
                                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                                  {opportunity.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Editar contacto</h3>
                      <ContactForm
                        action={saveContactAction}
                        defaultValues={defaultValues}
                        teamMembers={teamMembers}
                        tagsOptions={tagsOptions}
                        inline
                        onSuccess={handleClose}
                      />
                      <form action={deleteContactAction} className="flex justify-end">
                        <input type="hidden" name="id" value={contact.id} />
                        <SubmitButton label="Eliminar" pendingLabel="Eliminando..." variant="danger" />
                      </form>
                    </section>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
