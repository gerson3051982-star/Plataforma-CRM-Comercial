"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { opportunityUpsertSchema } from "@/lib/validators";
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

export async function saveOpportunityAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const idRaw = formData.get("id")?.toString();
    const payload = {
      id: idRaw ? Number(idRaw) : undefined,
      title: formData.get("title")?.toString().trim() ?? "",
      description: formData.get("description")?.toString().trim(),
      value: formData.get("value")?.toString().trim(),
      status: formData.get("status")?.toString().trim(),
      estimatedCloseDate: formData.get("estimatedCloseDate")?.toString().trim(),
      companyId: formData.get("companyId")?.toString(),
      contactId: formData.get("contactId")?.toString(),
      ownerId: formData.get("ownerId")?.toString(),
    };

    const parseResult = opportunityUpsertSchema.safeParse(payload);

    if (!parseResult.success) {
      return {
        status: "error",
        message: "Revisa los datos de la oportunidad",
        fieldErrors: mapFieldErrors(parseResult.error.flatten().fieldErrors),
      };
    }

    const data = parseResult.data;

    await prisma.opportunity.upsert({
      where: {
        id: data.id ?? 0,
      },
      create: {
        title: data.title,
        description: data.description,
        value: data.value ?? undefined,
        status: data.status ?? "NEW",
        estimatedCloseDate: data.estimatedCloseDate,
        companyId: data.companyId,
        contactId: data.contactId,
        ownerId: data.ownerId,
      },
      update: {
        title: data.title,
        description: data.description,
        value: data.value ?? undefined,
        status: data.status ?? "NEW",
        estimatedCloseDate: data.estimatedCloseDate,
        companyId: data.companyId,
        contactId: data.contactId,
        ownerId: data.ownerId,
      },
    });

    revalidatePath("/opportunities");
    revalidatePath("/activities");

    return {
      status: "success",
      message: data.id ? "Oportunidad actualizada" : "Oportunidad creada",
    };
  } catch (error) {
    console.error("saveOpportunityAction", error);
    return {
      status: "error",
      message: "No fue posible guardar la oportunidad",
    };
  }
}

export async function deleteOpportunityAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const id = Number(formData.get("id"));
    if (!id || Number.isNaN(id)) {
      return {
        status: "error",
        message: "Identificador inválido",
      };
    }

    await prisma.opportunity.delete({ where: { id } });
    revalidatePath("/opportunities");
    revalidatePath("/activities");

    return {
      status: "success",
      message: "Oportunidad eliminada",
    };
  } catch (error) {
    console.error("deleteOpportunityAction", error);
    return {
      status: "error",
      message: "No fue posible eliminar la oportunidad",
    };
  }
}
