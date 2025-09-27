"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { contactUpsertSchema } from "@/lib/validators";
import type { ActionState } from "./types";

function extractTags(formData: FormData): string[] {
  const raw = formData.getAll("tags");
  const values = raw.length > 0 ? raw : [formData.get("tagsCSV")].filter(Boolean);
  return values
    .flatMap((value) =>
      value
        ?.toString()
        .split(",")
        .map((part) => part.trim()) ?? []
    )
    .filter((value) => value.length > 0);
}

function mapFieldErrors(errors: Record<string, string[]> | undefined) {
  if (!errors) return undefined;
  return Object.entries(errors).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value && value.length > 0) {
      acc[key] = value[0];
    }
    return acc;
  }, {});
}

function pickTagColor(name: string) {
  const palette = [
    "#0ea5e9",
    "#6366f1",
    "#f97316",
    "#dc2626",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
  ];
  const index = Math.abs(name.toLowerCase().split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % palette.length;
  return palette[index];
}

export async function saveContactAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const tags = extractTags(formData);
    const idRaw = formData.get("id")?.toString();

    const parseResult = contactUpsertSchema.safeParse({
      id: idRaw ? Number(idRaw) : undefined,
      firstName: formData.get("firstName")?.toString().trim() ?? "",
      lastName: formData.get("lastName")?.toString().trim() ?? "",
      email: formData.get("email")?.toString().trim(),
      phone: formData.get("phone")?.toString().trim(),
      jobTitle: formData.get("jobTitle")?.toString().trim(),
      companyName: formData.get("companyName")?.toString().trim(),
      companyCity: formData.get("companyCity")?.toString().trim(),
      city: formData.get("city")?.toString().trim(),
      state: formData.get("state")?.toString().trim(),
      country: formData.get("country")?.toString().trim(),
      notes: formData.get("notes")?.toString().trim(),
      tags,
      ownerId: formData.get("ownerId")?.toString(),
    });

    if (!parseResult.success) {
      return {
        status: "error",
        message: "Revisa los datos del formulario",
        fieldErrors: mapFieldErrors(parseResult.error.flatten().fieldErrors),
      };
    }

    const data = parseResult.data;

    const contact = await prisma.$transaction(async (tx) => {
      let companyId: number | undefined;
      if (data.companyName) {
        const existingCompany = await tx.company.findFirst({
          where: {
            name: {
              equals: data.companyName,
              mode: "insensitive",
            },
            city: data.companyCity ?? data.city,
            country: data.country,
          },
        });

        const baseCompanyData = {
          name: data.companyName,
          city: data.companyCity ?? data.city,
          country: data.country,
          industry: undefined,
        } as const;

        const company = existingCompany
          ? await tx.company.update({
              where: { id: existingCompany.id },
              data: baseCompanyData,
            })
          : await tx.company.create({
              data: {
                ...baseCompanyData,
              },
            });

        companyId = company.id;
      }

      const contactPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        city: data.city,
        state: data.state,
        country: data.country,
        notes: data.notes,
        companyId,
        ownerId: data.ownerId,
      };

      const persistedContact = data.id
        ? await tx.contact.update({
            where: { id: data.id },
            data: contactPayload,
          })
        : await tx.contact.create({
            data: contactPayload,
          });

      await tx.contactTag.deleteMany({ where: { contactId: persistedContact.id } });

      if (data.tags && data.tags.length > 0) {
        const tagRecords = [] as { id: number }[];
        for (const tagName of data.tags) {
          const trimmed = tagName.trim();
          if (!trimmed) continue;

          const existingTag = await tx.tag.findFirst({
            where: {
              name: {
                equals: trimmed,
                mode: "insensitive",
              },
            },
          });

          const tagRecord = existingTag
            ? existingTag
            : await tx.tag.create({
                data: {
                  name: trimmed,
                  color: pickTagColor(trimmed),
                },
              });

          tagRecords.push({ id: tagRecord.id });
        }

        if (tagRecords.length > 0) {
          await tx.contactTag.createMany({
            data: tagRecords.map((tag) => ({
              contactId: persistedContact.id,
              tagId: tag.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      return persistedContact;
    });

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${contact.id}`);

    return {
      status: "success",
      message: data.id ? "Contacto actualizado" : "Contacto creado",
    };
  } catch (error) {
    console.error("saveContactAction", error);
    return {
      status: "error",
      message: "No fue posible guardar el contacto",
    };
  }
}

export async function deleteContactAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const idRaw = formData.get("id");
    const id = Number(idRaw);
    if (!id || Number.isNaN(id)) {
      return {
        status: "error",
        message: "Identificador de contacto inválido",
      };
    }

    await prisma.contact.delete({ where: { id } });
    revalidatePath("/contacts");
    revalidatePath("/opportunities");
    revalidatePath("/activities");

    return {
      status: "success",
      message: "Contacto eliminado",
    };
  } catch (error) {
    console.error("deleteContactAction", error);
    return {
      status: "error",
      message: "No fue posible eliminar el contacto",
    };
  }
}
