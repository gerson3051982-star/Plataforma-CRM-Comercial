"use client";

import { Fragment, useCallback, useState } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ActivityForm } from "@/components/activities/activity-form";
import { saveActivityAction, deleteActivityAction } from "@/actions/activities";
import { SubmitButton } from "@/components/form/submit-button";
import { formatDate, translateActivityType, translateActivityStatus } from "@/lib/utils";
import type { ActivityWithRelations } from "@/lib/data";

const typeColors: Record<ActivityWithRelations["type"], string> = {
  CALL: "bg-sky-100 text-sky-700",
  EMAIL: "bg-purple-100 text-purple-700",
  MEETING: "bg-amber-100 text-amber-700",
  TASK: "bg-emerald-100 text-emerald-700",
};

type Option = {
  id: number;
  label: string;
};

type ActivityItemProps = {
  activity: ActivityWithRelations;
  contacts: Option[];
  opportunities: Option[];
  teamMembers: Option[];
};

export function ActivityItem({ activity, contacts, opportunities, teamMembers }: ActivityItemProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <li
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
        aria-label={`Ver y editar la actividad ${activity.subject}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${typeColors[activity.type]}`}>
              {translateActivityType(activity.type)}
            </span>
            <h4 className="text-lg font-semibold text-slate-900">{activity.subject}</h4>
            <p className="text-sm text-slate-500">
              {activity.contact
                ? `${activity.contact.firstName} ${activity.contact.lastName}`
                : activity.opportunity?.title ?? "Sin referencia"}
            </p>
          </div>
          <div className="flex flex-col items-end text-xs text-slate-500">
            <p className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition group-hover:border-slate-300 group-hover:text-slate-900">
              <PencilSquareIcon className="h-4 w-4" /> Ver detalle
            </p>
            <p className="mt-2 font-semibold text-slate-700">{activity.teamMember?.name ?? "Equipo"}</p>
            <p>{formatDate(activity.createdAt)}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
            Estado: {translateActivityStatus(activity.status)}
          </span>
          {activity.scheduledFor ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
              Agendada: {formatDate(activity.scheduledFor)}
            </span>
          ) : null}
          {activity.dueDate ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
              Fecha límite: {formatDate(activity.dueDate)}
            </span>
          ) : null}
          {activity.completedAt ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
              Cerrada: {formatDate(activity.completedAt)}
            </span>
          ) : null}
        </div>

        {activity.notes ? <p className="mt-3 text-sm text-slate-600">{activity.notes}</p> : null}
      </li>

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
                    <div className="space-y-2">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${typeColors[activity.type]}`}>
                        {translateActivityType(activity.type)}
                      </span>
                      <Dialog.Title className="text-xl font-semibold text-slate-900">{activity.subject}</Dialog.Title>
                      <p className="text-sm text-slate-500">
                        Responsable: <span className="font-semibold text-slate-700">{activity.teamMember?.name ?? "Equipo"}</span>
                      </p>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Registrada {formatDate(activity.createdAt)}</p>
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

                  <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.1fr_1fr]">
                    <section className="space-y-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-sm text-slate-600">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Relacionado con</p>
                        {activity.contact ? (
                          <p>
                            Contacto: {" "}
                            <Link
                              href="/contacts"
                              className="font-semibold text-slate-800 underline-offset-4 hover:underline"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleClose();
                              }}
                            >
                              {activity.contact.firstName} {activity.contact.lastName}
                            </Link>
                          </p>
                        ) : null}
                        {activity.opportunity ? (
                          <p>
                            Oportunidad: {" "}
                            <Link
                              href="/opportunities"
                              className="font-semibold text-slate-800 underline-offset-4 hover:underline"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleClose();
                              }}
                            >
                              {activity.opportunity.title}
                            </Link>
                          </p>
                        ) : null}
                        {!activity.contact && !activity.opportunity ? <p>Sin asociación registrada.</p> : null}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Estado</p>
                        <p className="font-semibold text-slate-700">{translateActivityStatus(activity.status)}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          {activity.scheduledFor ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                              Agendada: {formatDate(activity.scheduledFor)}
                            </span>
                          ) : null}
                          {activity.dueDate ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                              Límite: {formatDate(activity.dueDate)}
                            </span>
                          ) : null}
                          {activity.completedAt ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
                              Resuelta: {formatDate(activity.completedAt)}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Notas</p>
                        <p className="mt-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                          {activity.notes ?? "Sin notas registradas."}
                        </p>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Editar actividad</h3>
                      <ActivityForm
                        action={saveActivityAction}
                        contacts={contacts}
                        opportunities={opportunities}
                        teamMembers={teamMembers}
                        inline
                        onSuccess={handleClose}
                        defaultValues={{
                          id: activity.id,
                          type: activity.type,
                          status: activity.status,
                          subject: activity.subject,
                          notes: activity.notes,
                          scheduledFor: activity.scheduledFor ? toInputDate(activity.scheduledFor) : undefined,
                          dueDate: activity.dueDate ? toInputDate(activity.dueDate) : undefined,
                          completedAt: activity.completedAt ? toInputDate(activity.completedAt) : undefined,
                          contactId: activity.contactId ?? undefined,
                          opportunityId: activity.opportunityId ?? undefined,
                          teamMemberId: activity.teamMemberId ?? undefined,
                        }}
                      />
                      <form action={deleteActivityAction} className="flex justify-end">
                        <input type="hidden" name="id" value={activity.id} />
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

function toInputDate(date: Date) {
  const iso = date.toISOString();
  return iso.slice(0, 16);
}
