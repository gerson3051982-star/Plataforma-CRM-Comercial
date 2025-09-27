"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PaintBrushIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/components/layout/theme-provider";
import { THEME_PALETTES, findPalette } from "@/lib/theme";

export function ThemeCustomizer() {
  const { paletteId, setPaletteId, accentHex, setAccentHex, resetAccent } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const activePalette = useMemo(() => findPalette(paletteId), [paletteId]);
  const isCustomAccent = useMemo(() => {
    const defaultAccent = activePalette.cssVars["--accent-500"]?.toLowerCase();
    return defaultAccent ? defaultAccent !== accentHex.toLowerCase() : false;
  }, [activePalette, accentHex]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-card)] px-[1.3rem] py-[0.76rem] text-[0.92rem] font-medium text-[var(--text-muted)] transition hover:border-[var(--accent-400)] hover:text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
      >
        <PaintBrushIcon className="h-[1.15rem] w-[1.15rem]" />
        Tema
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="absolute right-0 mt-3 w-80 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-4 shadow-xl backdrop-blur"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text-strong)]">Personaliza la interfaz</p>
              <p className="text-xs text-[var(--text-muted)]">
                Cambia la paleta y ajusta el color principal para adaptar el CRM a tu marca.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-transparent p-1 text-[var(--text-muted)] transition hover:border-[var(--border-soft)] hover:text-[var(--text-strong)]"
              aria-label="Cerrar selector de tema"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {THEME_PALETTES.map((palette) => {
              const isActive = palette.id === paletteId;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setPaletteId(palette.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    isActive
                      ? "border-[var(--accent-400)] bg-[var(--accent-50)]"
                      : "border-transparent bg-[var(--surface-hover)] hover:border-[var(--border-soft)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)]">
                        <div className="flex h-6 w-6 overflow-hidden rounded-md">
                          {palette.swatch.map((color) => (
                            <span key={`${palette.id}-${color}`} style={{ backgroundColor: color }} className="flex-1" />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-strong)]">{palette.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{palette.description}</p>
                      </div>
                    </div>
                    {isActive ? <CheckIcon className="h-5 w-5 text-[var(--accent-600)]" /> : null}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-hover)] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Color base</p>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="color"
                value={accentHex}
                onChange={(event) => setAccentHex(event.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--border-soft)] bg-transparent"
                aria-label="Selecciona el color principal"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--text-strong)]">{accentHex.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={resetAccent}
                  disabled={!isCustomAccent}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--text-muted)] disabled:opacity-50"
                >
                  Restablecer color
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
