"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME_ID, findPalette, generateAccentScale } from "@/lib/theme";

type ThemeContextValue = {
  paletteId: string;
  setPaletteId: (id: string) => void;
  accentHex: string;
  setAccentHex: (hex: string) => void;
  resetAccent: () => void;
};

const STORAGE_KEY = "crm-theme-settings";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeState = {
  paletteId: string;
  accentHex?: string;
};

function serializeState(state: ThemeState) {
  return JSON.stringify(state);
}

function applyCssVariables(entries: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(entries).forEach(([token, value]) => {
    root.style.setProperty(token, value);
  });
}

function sanitizeHex(value: string): string {
  if (!value) return "";
  const hex = value.startsWith("#") ? value : `#${value}`;
  const match = hex.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  return match ? hex.toLowerCase() : "";
}

function readPersistedState(): ThemeState | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as ThemeState;
    if (parsed && typeof parsed === "object" && parsed.paletteId) {
      return {
        paletteId: parsed.paletteId,
        accentHex: sanitizeHex(parsed.accentHex ?? ""),
      };
    }
  } catch (error) {
    console.warn("No se pudo leer la configuración de tema", error);
  }
  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [paletteId, setPaletteId] = useState(DEFAULT_THEME_ID);
  const [accentOverride, setAccentOverride] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const persisted = readPersistedState();
    if (persisted) {
      setPaletteId(findPalette(persisted.paletteId).id);
      if (persisted.accentHex) {
        setAccentOverride(persisted.accentHex);
      }
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const palette = findPalette(paletteId);
    applyCssVariables(palette.cssVars);

    const accentSource = accentOverride ?? palette.cssVars["--accent-500"] ?? "";
    if (accentSource) {
      const accentScale = generateAccentScale(accentSource);
      applyCssVariables(accentScale);
    }

    const payload: ThemeState = {
      paletteId,
      accentHex: accentOverride ?? undefined,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, serializeState(payload));
    } catch (error) {
      console.warn("No se pudo guardar la configuración de tema", error);
    }
  }, [paletteId, accentOverride, isReady]);

  const accentHex = useMemo(() => {
    if (accentOverride) return accentOverride;
    const palette = findPalette(paletteId);
    return palette.cssVars["--accent-500"] ?? "#0ea5e9";
  }, [paletteId, accentOverride]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      paletteId,
      setPaletteId,
      accentHex,
      setAccentHex: (hex: string) => {
        const sanitized = sanitizeHex(hex);
        setAccentOverride(sanitized || null);
      },
      resetAccent: () => setAccentOverride(null),
    }),
    [paletteId, accentHex]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return context;
}
