export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const CURRENCY_LOCALE = "es-MX";

export function formatCurrency(value: number | string | null | undefined, currency = "MXN") {
  if (value === null || value === undefined) return "-";
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) return "-";
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Sin fecha";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const OPPORTUNITY_STATUS_LABELS = {
  NEW: "Nueva",
  IN_PROGRESS: "En progreso",
  WON: "Ganada",
  LOST: "Perdida",
} as const;

type OpportunityStatus = keyof typeof OPPORTUNITY_STATUS_LABELS;

export function translateOpportunityStatus(status: string) {
  return OPPORTUNITY_STATUS_LABELS[status as OpportunityStatus] ?? status;
}

const ACTIVITY_TYPE_LABELS = {
  CALL: "Llamada",
  EMAIL: "Correo",
  MEETING: "Reunión",
  TASK: "Tarea",
} as const;

type ActivityType = keyof typeof ACTIVITY_TYPE_LABELS;

export function translateActivityType(type: string) {
  return ACTIVITY_TYPE_LABELS[type as ActivityType] ?? type;
}

const ACTIVITY_STATUS_LABELS = {
  PLANNED: "Planificada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
} as const;

type ActivityStatus = keyof typeof ACTIVITY_STATUS_LABELS;

export function translateActivityStatus(status: string) {
  return ACTIVITY_STATUS_LABELS[status as ActivityStatus] ?? status;
}

export function initials(firstName: string, lastName: string) {
  return `${(firstName?.[0] ?? "").toUpperCase()}${(lastName?.[0] ?? "").toUpperCase()}`;
}
