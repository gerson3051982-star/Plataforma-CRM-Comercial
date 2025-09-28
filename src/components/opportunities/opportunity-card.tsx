"use client";

import { useActionState, useEffect, useState, type KeyboardEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { saveOpportunityAction, deleteOpportunityAction } from "@/actions/opportunities";
import { initialActionState } from "@/actions/types";
import { SubmitButton } from "@/components/form/submit-button";
import { formatCurrency, formatDate, translateOpportunityStatus, translateActivityType } from "@/lib/utils";
import type { OpportunityWithRelations } from "@/lib/data";

const statusColors: Record<OpportunityCardProps['opportunity']['status'], string> = {
  NEW: "bg-sky-100 text-sky-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  WON: "bg-emerald-100 text-emerald-700",
  LOST: "bg-rose-100 text-rose-700",
};

type Option = {
  id: number;
  label: string;
};

type OpportunityCardProps = {
  opportunity: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string | null;
    value: number | null;
    status: "NEW" | "IN_PROGRESS" | "WON" | "LOST";
    estimatedCloseDate: Date | null;
    companyId: number | null;
    contactId: number | null;
    ownerId: number | null;
    company: OpportunityWithRelations['company'];
    contact: OpportunityWithRelations['contact'];
    owner: OpportunityWithRelations['owner'];
    activities: OpportunityWithRelations['activities'];
  };
  companies: Option[];
  contacts: Option[];
  teamMembers: Option[];
};

export function OpportunityCard({ opportunity, companies, contacts, teamMembers }: OpportunityCardProps) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const [deleteState, deleteAction] = useActionState(deleteOpportunityAction, initialActionState);

  useEffect(() => {
    if (deleteState.status === "success") {
      setEditing(false);
    }
  }, [deleteState.status]);

  const handleCardClick = (event: MouseEvent<HTMLArticleElement>) => {
    if (editing) return;

    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, select, form")) {
      return;
    }

    router.push(`/opportunities/${opportunity.id}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLArticleElement>) => {
    if (editing) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, select, form")) {
      return;
    }

    event.preventDefault();
    router.push(`/opportunities/${opportunity.id}`);
  };

  return (
    <article
      className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{opportunity.title}</h4>
          <p className="text-sm text-slate-500">
            {opportunity.company?.name ?? "Sin empresa"} · {opportunity.contact ? `${opportunity.contact.firstName} ${opportunity.contact.lastName}` : "Contacto sin asignar"}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusColors[opportunity.status]}`}>
          {translateOpportunityStatus(opportunity.status)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <p className="text-2xl font-semibold text-slate-900">{formatCurrency(opportunity.value ? Number(opportunity.value) : 0)}</p>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-slate-400">Cierre estimado</p>
          <p className="text-sm font-semibold text-slate-700">{formatDate(opportunity.estimatedCloseDate)}</p>
        </div>
      </div>

      {opportunity.description ? (
        <p className="mt-3 text-sm text-slate-600">{opportunity.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
          Responsable: {opportunity.owner?.name ?? "Sin asignar"}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
          Actividades: {opportunity.activities.length}
        </span>
      </div>

      {opportunity.activities.length > 0 ? (
        <ul className="mt-3 space-y-2 text-xs text-slate-500">
          {opportunity.activities.map((activity) => (
            <li key={activity.id} className="rounded-xl bg-slate-50 px-3 py-2">
              <span className="font-semibold text-slate-700">{activity.subject}</span> · {translateActivityType(activity.type)} · {formatDate(activity.dueDate)}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex justify-end gap-2 text-sm">
        <button
          type="button"
          className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          onClick={(event) => {
            event.stopPropagation();
            setEditing((value) => !value);
          }}
        >
          {editing ? "Cerrar" : "Editar"}
        </button>
      </div>

      {editing ? (
        <div
          className="mt-4 space-y-4"
          onClick={(event) => event.stopPropagation()}
          role="presentation"
        >
          <OpportunityForm
            action={saveOpportunityAction}
            defaultValues={{
              id: opportunity.id,
              title: opportunity.title,
              description: opportunity.description,
              value: opportunity.value?.toString(),
              status: opportunity.status,
              estimatedCloseDate: opportunity.estimatedCloseDate
                ? opportunity.estimatedCloseDate.toISOString().slice(0, 10)
                : undefined,
              companyId: opportunity.companyId ?? undefined,
              contactId: opportunity.contactId ?? undefined,
              ownerId: opportunity.ownerId ?? undefined,
            }}
            companies={companies}
            contacts={contacts}
            teamMembers={teamMembers}
            inline
            onSuccess={() => setEditing(false)}
          />
          <form
            action={deleteAction}
            className="flex justify-end"
            onClick={(event) => event.stopPropagation()}
          >
            <input type="hidden" name="id" value={opportunity.id} />
            {deleteState.status === "error" ? (
              <p className="mr-4 self-center text-xs text-rose-500">
                {deleteState.message ?? "No fue posible eliminar la oportunidad"}
              </p>
            ) : null}
            <SubmitButton label="Eliminar" pendingLabel="Eliminando..." variant="danger" />
          </form>
        </div>
      ) : null}
    </article>
  );
}
