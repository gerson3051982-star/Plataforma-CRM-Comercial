import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .refine((value) => /[A-Z]/.test(value), {
    message: "Incluye al menos una letra mayúscula",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "Incluye al menos una letra minúscula",
  })
  .refine((value) => /\d/.test(value), {
    message: "Incluye al menos un número",
  });

export const contactUpsertSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z
    .string()
    .email("Correo inválido")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  jobTitle: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  companyName: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  companyCity: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  city: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  state: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  country: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  notes: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  tags: z.array(z.string().min(1)).optional().default([]),
  ownerId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().optional()),
});

export const contactSearchSchema = z.object({
  query: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  groupBy: z
    .enum(["none", "city", "company", "tag"])
    .optional()
    .default("none"),
});

export const opportunityUpsertSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "El título es obligatorio"),
  description: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  value: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  status: z
    .enum(["NEW", "IN_PROGRESS", "WON", "LOST"])
    .default("NEW"),
  estimatedCloseDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? new Date(value) : undefined)),
  companyId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().optional()),
  contactId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().optional()),
  ownerId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().optional()),
});

export const activityUpsertSchema = z.object({
  id: z.number().optional(),
  type: z.enum(["CALL", "EMAIL", "MEETING", "TASK"]),
  status: z
    .enum(["PLANNED", "COMPLETED", "CANCELLED"])
    .default("PLANNED"),
  subject: z.string().min(1, "El asunto es requerido"),
  notes: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  scheduledFor: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? new Date(value) : undefined)),
  dueDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? new Date(value) : undefined)),
  completedAt: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? new Date(value) : undefined)),
  contactId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().optional()),
  opportunityId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().optional()),
  teamMemberId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().optional()),
});

export const activityFilterSchema = z.object({
  type: z
    .enum(["ALL", "CALL", "EMAIL", "MEETING", "TASK"])
    .optional()
    .default("ALL"),
  dateField: z
    .enum(["created", "scheduled", "due", "resolved"])
    .optional()
    .default("created"),
  from: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? new Date(value) : undefined)),
  to: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? new Date(value) : undefined)),
});

export type ContactPayload = z.infer<typeof contactUpsertSchema>;
export type OpportunityPayload = z.infer<typeof opportunityUpsertSchema>;
export type ActivityPayload = z.infer<typeof activityUpsertSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Ingresa tu nombre completo"),
    email: z.string().email("Correo inválido").transform((value) => value.toLowerCase()),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre completo"),
  role: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterPayload = z.infer<typeof registerSchema>;
export type ProfileUpdatePayload = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>;
