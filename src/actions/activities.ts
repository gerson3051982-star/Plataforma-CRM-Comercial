"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { activityUpsertSchema } from "@/lib/validators";
import type { ActionState } from "./types";

function mapFieldErrors(errors: Record<string, string[]> | undefined) {
  if (!errors) return undefined;
  return Object.entries(errors).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value?.length) {
      acc[key] = value[0];
    }
    return acc;
  }, {});
}

export async function saveActivityAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const idRaw = formData.get("id")?.toString();
    const payload = {
      id: idRaw ? Number(idRaw) : undefined,
      type: formData.get("type")?.toString().trim() ?? "CALL",
      status: formData.get("status")?.toString().trim() ?? "PLANNED",
      subject: formData.get("subject")?.toString().trim() ?? "",
      notes: formData.get("notes")?.toString().trim(),
      scheduledFor: formData.get("scheduledFor")?.toString().trim(),
      dueDate: formData.get("dueDate")?.toString().trim(),
      completedAt: formData.get("completedAt")?.toString().trim(),
      contactId: formData.get("contactId")?.toString(),
      opportunityId: formData.get("opportunityId")?.toString(),
      teamMemberId: formData.get("teamMemberId")?.toString(),
    };

    const parseResult = activityUpsertSchema.safeParse(payload);

    if (!parseResult.success) {
      return {
        status: "error",
        message: "Revisa los datos de la actividad",
        fieldErrors: mapFieldErrors(parseResult.error.flatten().fieldErrors),
      };
    }

    const data = parseResult.data;

    if (!data.contactId && !data.opportunityId) {
      return {
        status: "error",
        message: "Asocia la actividad a un contacto u oportunidad",
        fieldErrors: { contactId: "Selecciona un registro" },
      };
    }

    await prisma.activity.upsert({
      where: { id: data.id ?? 0 },
      create: {
        type: data.type,
        status: data.status,
        subject: data.subject,
        notes: data.notes,
        scheduledFor: data.scheduledFor,
        dueDate: data.dueDate,
        completedAt: data.completedAt,
        contactId: data.contactId,
        opportunityId: data.opportunityId,
        teamMemberId: data.teamMemberId,
      },
      update: {
        type: data.type,
        status: data.status,
        subject: data.subject,
        notes: data.notes,
        scheduledFor: data.scheduledFor,
        dueDate: data.dueDate,
        completedAt: data.completedAt,
        contactId: data.contactId,
        opportunityId: data.opportunityId,
        teamMemberId: data.teamMemberId,
      },
    });

    revalidatePath("/activities");
    revalidatePath("/contacts");
    revalidatePath("/opportunities");

    return {
      status: "success",
      message: data.id ? "Actividad actualizada" : "Actividad registrada",
    };
  } catch (error) {
    console.error("saveActivityAction", error);
    return {
      status: "error",
      message: "No fue posible guardar la actividad",
    };
  }
}

export async function deleteActivityAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const id = Number(formData.get("id"));
    if (!id || Number.isNaN(id)) {
      return {
        status: "error",
        message: "Identificador inválido",
      };
    }

    await prisma.activity.delete({ where: { id } });
    revalidatePath("/activities");

    return {
      status: "success",
      message: "Actividad eliminada",
    };
  } catch (error) {
    console.error("deleteActivityAction", error);
    return {
      status: "error",
      message: "No fue posible eliminar la actividad",
    };
  }
}
