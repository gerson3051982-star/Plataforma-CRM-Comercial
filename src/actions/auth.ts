"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  registerSchema,
  profileUpdateSchema,
  changePasswordSchema,
} from "@/lib/validators";
import type { ActionState } from "@/actions/types";

function mapFieldErrors(errors: Record<string, string[]> | undefined) {
  if (!errors) return undefined;
  return Object.entries(errors).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value?.length) {
      acc[key] = value[0];
    }
    return acc;
  }, {});
}

export async function registerUserAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const payload = {
      name: formData.get("name")?.toString().trim() ?? "",
      email: formData.get("email")?.toString().trim().toLowerCase() ?? "",
      password: formData.get("password")?.toString() ?? "",
      confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
      role: formData.get("role")?.toString().trim() ?? "",
    };

    const parseResult = registerSchema.safeParse(payload);

    if (!parseResult.success) {
      return {
        status: "error",
        message: "Revisa los datos del formulario",
        fieldErrors: mapFieldErrors(parseResult.error.flatten().fieldErrors),
      };
    }

    const data = parseResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        status: "error",
        message: "El correo ya está registrado",
        fieldErrors: { email: "Ya existe una cuenta con este correo" },
      };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role ?? "member",
        passwordHash,
        teamMember: {
          create: {
            name: data.name,
            email: data.email,
            role: data.role ?? "Ejecutivo",
          },
        },
      },
    });

    return {
      status: "success",
      message: "Cuenta creada. Ahora puedes iniciar sesión",
    };
  } catch (error) {
    console.error("registerUserAction", error);
    return {
      status: "error",
      message: "No pudimos crear tu cuenta. Intenta nuevamente.",
    };
  }
}

export async function updateProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        status: "error",
        message: "No pudimos validar tu sesión. Inicia sesión nuevamente.",
      };
    }

    const payload = {
      name: formData.get("name")?.toString().trim() ?? "",
      role: formData.get("role")?.toString().trim() ?? "",
    };

    const parseResult = profileUpdateSchema.safeParse(payload);

    if (!parseResult.success) {
      return {
        status: "error",
        message: "Revisa los datos del formulario",
        fieldErrors: mapFieldErrors(parseResult.error.flatten().fieldErrors),
      };
    }

    const data = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { teamMember: true },
    });

    if (!user) {
      return {
        status: "error",
        message: "No encontramos tu usuario.",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        role: data.role ?? null,
        teamMember: user.teamMember
          ? {
              update: {
                name: data.name,
                role: data.role ?? null,
              },
            }
          : undefined,
      },
    });

    return {
      status: "success",
      message: "Perfil actualizado correctamente.",
    };
  } catch (error) {
    console.error("updateProfileAction", error);
    return {
      status: "error",
      message: "No pudimos actualizar tu perfil. Intenta nuevamente.",
    };
  }
}

export async function changePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        status: "error",
        message: "No pudimos validar tu sesión. Inicia sesión nuevamente.",
      };
    }

    const payload = {
      currentPassword: formData.get("currentPassword")?.toString() ?? "",
      newPassword: formData.get("newPassword")?.toString() ?? "",
      confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
    };

    const parseResult = changePasswordSchema.safeParse(payload);

    if (!parseResult.success) {
      return {
        status: "error",
        message: "Revisa los datos del formulario",
        fieldErrors: mapFieldErrors(parseResult.error.flatten().fieldErrors),
      };
    }

    const data = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return {
        status: "error",
        message: "No encontramos tu usuario.",
      };
    }

    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      return {
        status: "error",
        message: "La contraseña actual es incorrecta.",
        fieldErrors: { currentPassword: "Contraseña actual incorrecta" },
      };
    }

    const samePassword = await bcrypt.compare(data.newPassword, user.passwordHash);

    if (samePassword) {
      return {
        status: "error",
        message: "Tu nueva contraseña debe ser diferente a la actual.",
        fieldErrors: { newPassword: "Elige una contraseña diferente" },
      };
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return {
      status: "success",
      message: "Contraseña actualizada exitosamente.",
    };
  } catch (error) {
    console.error("changePasswordAction", error);
    return {
      status: "error",
      message: "No pudimos actualizar tu contraseña. Intenta nuevamente.",
    };
  }
}
