"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  PhoneArrowUpRightIcon,
  PlusIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { saveContactAction } from "@/actions/contacts";
import { saveOpportunityAction } from "@/actions/opportunities";
import { saveActivityAction } from "@/actions/activities";
import { ContactForm } from "@/components/contacts/contact-form";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { ActivityForm } from "@/components/activities/activity-form";
import { classNames } from "@/lib/utils";

type QuickCreateOption = {
  id: number;
  label: string;
};

type QuickCreateContact = {
  id: number;
  name: string;
};

type QuickCreateTag = {
  id: number;
  name: string;
  color: string | null;
};

export type QuickCreateData = {
  contact: {
    teamMembers: QuickCreateContact[];
    tags: QuickCreateTag[];
  };
  opportunity: {
    companies: QuickCreateOption[];
    contacts: QuickCreateOption[];
    teamMembers: QuickCreateOption[];
  };
  activity: {
    contacts: QuickCreateOption[];
    opportunities: QuickCreateOption[];
    teamMembers: QuickCreateOption[];
  };
};

type Mode = "contact" | "opportunity" | "activity";

type QuickCreateProps = {
  data: QuickCreateData;
};

type CardConfig = {
  key: Mode;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof UserPlusIcon;
  chipClass: string;
  iconClass: string;
};

const cards: CardConfig[] = [
  {
    key: "contact",
    title: "Nuevo contacto",
    subtitle: "Personas",
    description: "Captura datos clave, etiquetas y responsable para activar el seguimiento.",
    icon: UserPlusIcon,
    chipClass: "border border-sky-100 bg-sky-50 text-sky-600",
    iconClass: "bg-sky-100 text-sky-600",
  },
  {
    key: "opportunity",
    title: "Nueva oportunidad",
    subtitle: "Pipeline",
    description: "Registra valor estimado, etapas y vínculos para tu pipeline comercial.",
    icon: BriefcaseIcon,
    chipClass: "border border-indigo-100 bg-indigo-50 text-indigo-600",
    iconClass: "bg-indigo-100 text-indigo-600",
  },
  {
    key: "activity",
    title: "Registrar actividad",
    subtitle: "Seguimiento",
    description: "Documenta llamadas, correos, reuniones o tareas en segundos.",
    icon: PhoneArrowUpRightIcon,
    chipClass: "border border-emerald-100 bg-emerald-50 text-emerald-600",
    iconClass: "bg-emerald-100 text-emerald-600",
  },
];

const STORAGE_KEYS = {
  position: "quickCreate.position",
  size: "quickCreate.size",
} as const;

const INITIAL_BUTTON_SIZE = 56;
const MIN_SIZE = 48;
const MAX_SIZE = 104;
const POSITION_PADDING = 12;

function clampSize(value: number) {
  return Math.min(Math.max(value, MIN_SIZE), MAX_SIZE);
}

function clampPosition(x: number, y: number, size: number) {
  if (typeof window === "undefined") {
    return { x, y };
  }
  const maxX = Math.max(POSITION_PADDING, window.innerWidth - size - POSITION_PADDING);
  const maxY = Math.max(POSITION_PADDING, window.innerHeight - size - POSITION_PADDING);
  return {
    x: Math.min(Math.max(POSITION_PADDING, x), maxX),
    y: Math.min(Math.max(POSITION_PADDING, y), maxY),
  };
}

function getDefaultPosition(size: number) {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }
  const x = window.innerWidth - size - POSITION_PADDING * 2;
  const y = window.innerHeight - size - POSITION_PADDING * 2;
  return clampPosition(x, y, size);
}

export function QuickCreate({ data }: QuickCreateProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [buttonSize, setButtonSize] = useState<number>(INITIAL_BUTTON_SIZE);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const interactionState = useRef<
    | {
        pointerId: number;
        type: "drag" | "resize";
        offsetX: number;
        offsetY: number;
        startSize: number;
        startX: number;
        startY: number;
        moved: boolean;
      }
    | null
  >(null);
  const skipNextToggle = useRef(false);

  const ensurePosition = useCallback(
    (size: number) => {
      if (position) return position;
      const fallback = getDefaultPosition(size);
      setPosition(fallback);
      return fallback;
    },
    [position]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedSizeRaw = window.localStorage.getItem(STORAGE_KEYS.size);
    const parsedSize = storedSizeRaw ? Number.parseInt(storedSizeRaw, 10) : Number.NaN;
    const initialSize = Number.isFinite(parsedSize) ? clampSize(parsedSize) : INITIAL_BUTTON_SIZE;
    setButtonSize(initialSize);

    const storedPositionRaw = window.localStorage.getItem(STORAGE_KEYS.position);
    if (storedPositionRaw) {
      try {
        const parsed = JSON.parse(storedPositionRaw) as { x?: number; y?: number } | null;
        if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
          const safePosition = clampPosition(parsed.x, parsed.y, initialSize);
          setPosition(safePosition);
          return;
        }
      } catch (error) {
        console.warn("quickCreate.position parse failed", error);
      }
    }

    setPosition(getDefaultPosition(initialSize));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPosition((prev) => (prev ? clampPosition(prev.x, prev.y, buttonSize) : prev));
  }, [buttonSize]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setPosition((prev) => (prev ? clampPosition(prev.x, prev.y, buttonSize) : prev));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [buttonSize]);

  useEffect(() => {
    if (typeof window === "undefined" || !position) return;
    window.localStorage.setItem(STORAGE_KEYS.position, JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.size, String(buttonSize));
  }, [buttonSize]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setMode(null);
  }, []);

  const handleSuccess = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleButtonPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      const currentPosition = ensurePosition(buttonSize);
      interactionState.current = {
        pointerId: event.pointerId,
        type: "drag",
        offsetX: event.clientX - currentPosition.x,
        offsetY: event.clientY - currentPosition.y,
        startSize: buttonSize,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
      };
      skipNextToggle.current = false;
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    },
    [buttonSize, ensurePosition]
  );

  const handleResizePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      const currentPosition = ensurePosition(buttonSize);
      interactionState.current = {
        pointerId: event.pointerId,
        type: "resize",
        offsetX: currentPosition.x,
        offsetY: currentPosition.y,
        startSize: buttonSize,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
      };
      skipNextToggle.current = true;
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    },
    [buttonSize, ensurePosition]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<Element>) => {
      const state = interactionState.current;
      if (!state || state.pointerId !== event.pointerId) return;

      state.moved = true;
      skipNextToggle.current = true;

      if (state.type === "drag") {
        const nextX = event.clientX - state.offsetX;
        const nextY = event.clientY - state.offsetY;
        setPosition(clampPosition(nextX, nextY, buttonSize));
      } else if (state.type === "resize") {
        const deltaX = event.clientX - state.startX;
        const deltaY = event.clientY - state.startY;
        const delta = Math.max(deltaX, deltaY);
        const nextSize = clampSize(state.startSize + delta);
        setButtonSize(nextSize);
        setPosition((prev) => {
          const base = prev ?? ensurePosition(state.startSize);
          return clampPosition(base.x, base.y, nextSize);
        });
      }
    },
    [buttonSize, ensurePosition]
  );

  const handlePointerUp = useCallback((event: ReactPointerEvent<Element>) => {
    const state = interactionState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    if (state.moved) {
      skipNextToggle.current = true;
    }

    interactionState.current = null;

    const currentTarget = event.currentTarget as HTMLElement | null;
    if (currentTarget?.hasPointerCapture?.(event.pointerId)) {
      currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handleButtonClick = useCallback(() => {
    if (skipNextToggle.current) {
      skipNextToggle.current = false;
      return;
    }
    if (open) {
      handleClose();
    } else {
      setOpen(true);
    }
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) return undefined;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [open]);

  const currentCard = useMemo(() => cards.find((card) => card.key === mode) ?? null, [mode]);

  const floatingButtonStyle = useMemo(() => {
    if (!position) {
      return {
        bottom: "1.5rem",
        right: "1.5rem",
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
      } satisfies CSSProperties;
    }
    return {
      top: `${position.y}px`,
      left: `${position.x}px`,
      width: `${buttonSize}px`,
      height: `${buttonSize}px`,
    } satisfies CSSProperties;
  }, [buttonSize, position]);

  const iconSize = useMemo(() => {
    const base = Math.min(buttonSize - 16, buttonSize * 0.55);
    return Math.round(Math.max(24, base));
  }, [buttonSize]);

  return (
    <>
      <div className="fixed z-40" style={floatingButtonStyle}>
        <button
          type="button"
          aria-label={open ? "Cerrar acciones rápidas" : "Abrir acciones rápidas"}
          aria-pressed={open}
          onClick={handleButtonClick}
          onPointerDown={handleButtonPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative flex h-full w-full items-center justify-center rounded-full border border-[var(--accent-200)] bg-[var(--accent-500)] text-[var(--accent-foreground)] shadow-lg shadow-[var(--accent-500)]/30 transition hover:bg-[var(--accent-600)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-app)]"
        >
          <PlusIcon
            className={classNames("transition", open ? "rotate-45" : "")}
            style={{ width: iconSize, height: iconSize }}
          />
          <span
            className="absolute -bottom-1 -right-1 h-4 w-4 cursor-se-resize rounded-full border border-white bg-white/80 shadow"
            aria-hidden
            onPointerDown={handleResizePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            title="Arrastra para ajustar el tamaño"
          />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4 py-8 sm:px-8">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose} />
          <div
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface-card)] shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] bg-[var(--surface-overlay)] px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--text-muted)]">
                  Acciones rápidas
                </p>
                <h3 className="text-lg font-semibold text-[var(--text-strong)]">
                  {currentCard ? currentCard.title : "Crear o registrar"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-[var(--border-soft)] p-2 text-[var(--text-muted)] transition hover:border-[var(--accent-400)] hover:text-[var(--text-strong)]"
                aria-label="Cerrar"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
              {mode === null ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cards.map((card) => (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => setMode(card.key)}
                      className="group flex h-full flex-col justify-between rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 text-left shadow-sm transition hover:border-[var(--accent-200)] hover:shadow-md"
                    >
                      <span className={classNames("inline-flex max-w-max items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]", card.chipClass)}>
                        {card.subtitle}
                      </span>
                      <div className="mt-4 space-y-3">
                        <div className={classNames("inline-flex items-center justify-center rounded-2xl p-3", card.iconClass)}>
                          <card.icon className="h-6 w-6" />
                        </div>
                        <p className="text-lg font-semibold text-[var(--text-strong)]">{card.title}</p>
                        <p className="text-sm text-[var(--text-muted)]">{card.description}</p>
                      </div>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-500)] transition group-hover:text-[var(--accent-600)]">
                        Elegir
                        <ArrowLeftIcon className="h-4 w-4 rotate-180" />
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-[var(--text-muted)]">
                        {currentCard?.subtitle}
                      </p>
                      <h4 className="text-xl font-semibold text-[var(--text-strong)]">
                        {currentCard?.title}
                      </h4>
                      <p className="mt-1 max-w-lg text-sm text-[var(--text-muted)]">
                        {currentCard?.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode(null)}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent-300)] hover:text-[var(--text-strong)]"
                    >
                      <ArrowLeftIcon className="h-4 w-4" />
                      Elegir otra acción
                    </button>
                  </div>

                  {mode === "contact" ? (
                    <ContactForm
                      action={saveContactAction}
                      teamMembers={data.contact.teamMembers}
                      tagsOptions={data.contact.tags}
                      inline
                      onSuccess={handleSuccess}
                    />
                  ) : null}

                  {mode === "opportunity" ? (
                    <OpportunityForm
                      action={saveOpportunityAction}
                      companies={data.opportunity.companies}
                      contacts={data.opportunity.contacts}
                      teamMembers={data.opportunity.teamMembers}
                      inline
                      defaultValues={{ status: "NEW" }}
                      onSuccess={handleSuccess}
                    />
                  ) : null}

                  {mode === "activity" ? (
                    <ActivityForm
                      action={saveActivityAction}
                      contacts={data.activity.contacts}
                      opportunities={data.activity.opportunities}
                      teamMembers={data.activity.teamMembers}
                      inline
                      onSuccess={handleSuccess}
                    />
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
