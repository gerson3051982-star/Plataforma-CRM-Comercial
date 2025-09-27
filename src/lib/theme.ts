export type ThemePalette = {
  id: string;
  name: string;
  description: string;
  swatch: string[];
  cssVars: Record<string, string>;
};

const skyPalette: ThemePalette = {
  id: "sky",
  name: "Skyflow",
  description: "Azules brillantes con toques limpios y profesionales.",
  swatch: ["#e0f2fe", "#0ea5e9", "#0369a1"],
  cssVars: {
    "--background": "#f1f5f9",
    "--foreground": "#0f172a",
    "--surface-app": "#f1f5f9",
    "--surface-sidebar": "rgba(255, 255, 255, 0.92)",
    "--surface-card": "#ffffff",
    "--surface-card-glass": "rgba(255, 255, 255, 0.68)",
    "--surface-overlay": "rgba(255, 255, 255, 0.78)",
    "--surface-hover": "#f8fafc",
    "--border-soft": "rgba(148, 163, 184, 0.28)",
    "--border-strong": "rgba(15, 23, 42, 0.12)",
    "--text-strong": "#0f172a",
    "--text-muted": "#475569",
    "--accent-foreground": "#ffffff",
    "--accent-ring": "rgba(14, 165, 233, 0.35)",
    "--accent-50": "#f0f9ff",
    "--accent-100": "#e0f2fe",
    "--accent-200": "#bae6fd",
    "--accent-300": "#7dd3fc",
    "--accent-400": "#38bdf8",
    "--accent-500": "#0ea5e9",
    "--accent-600": "#0284c7",
    "--accent-700": "#0369a1",
    "--accent-800": "#075985",
    "--hero-from": "rgba(14, 165, 233, 0.06)",
    "--hero-to": "rgba(14, 165, 233, 0.01)",
  },
};

const auroraPalette: ThemePalette = {
  id: "aurora",
  name: "Aurora",
  description: "Verdes inspirados en crecimiento y frescura.",
  swatch: ["#dcfce7", "#10b981", "#047857"],
  cssVars: {
    "--background": "#f1f7f3",
    "--foreground": "#0b1620",
    "--surface-app": "#f1f7f3",
    "--surface-sidebar": "rgba(255, 255, 255, 0.9)",
    "--surface-card": "#ffffff",
    "--surface-card-glass": "rgba(255, 255, 255, 0.7)",
    "--surface-overlay": "rgba(255, 255, 255, 0.78)",
    "--surface-hover": "#f6fbf8",
    "--border-soft": "rgba(52, 211, 153, 0.22)",
    "--border-strong": "rgba(15, 118, 110, 0.18)",
    "--text-strong": "#0f172a",
    "--text-muted": "#466460",
    "--accent-foreground": "#03241a",
    "--accent-ring": "rgba(16, 185, 129, 0.35)",
    "--accent-50": "#ecfdf5",
    "--accent-100": "#d1fae5",
    "--accent-200": "#a7f3d0",
    "--accent-300": "#6ee7b7",
    "--accent-400": "#34d399",
    "--accent-500": "#10b981",
    "--accent-600": "#059669",
    "--accent-700": "#047857",
    "--accent-800": "#065f46",
    "--hero-from": "rgba(16, 185, 129, 0.05)",
    "--hero-to": "rgba(16, 185, 129, 0.02)",
  },
};

const sunsetPalette: ThemePalette = {
  id: "sunset",
  name: "Sunset",
  description: "Naranjas cálidos con energía y dinamismo.",
  swatch: ["#ffedd5", "#f97316", "#c2410c"],
  cssVars: {
    "--background": "#fdf6f0",
    "--foreground": "#1f1a17",
    "--surface-app": "#fdf6f0",
    "--surface-sidebar": "rgba(255, 255, 255, 0.95)",
    "--surface-card": "#ffffff",
    "--surface-card-glass": "rgba(255, 255, 255, 0.74)",
    "--surface-overlay": "rgba(255, 255, 255, 0.82)",
    "--surface-hover": "#fff7ed",
    "--border-soft": "rgba(248, 180, 107, 0.25)",
    "--border-strong": "rgba(194, 65, 12, 0.2)",
    "--text-strong": "#1f1a17",
    "--text-muted": "#7b5644",
    "--accent-foreground": "#2f1103",
    "--accent-ring": "rgba(249, 115, 22, 0.35)",
    "--accent-50": "#fff7ed",
    "--accent-100": "#ffedd5",
    "--accent-200": "#fed7aa",
    "--accent-300": "#fdba74",
    "--accent-400": "#fb923c",
    "--accent-500": "#f97316",
    "--accent-600": "#ea580c",
    "--accent-700": "#c2410c",
    "--accent-800": "#9a3412",
    "--hero-from": "rgba(249, 115, 22, 0.05)",
    "--hero-to": "rgba(249, 115, 22, 0.015)",
  },
};

const midnightPalette: ThemePalette = {
  id: "midnight",
  name: "Midnight",
  description: "Oscuros elegantes con acentos índigo.",
  swatch: ["#312e81", "#6366f1", "#a855f7"],
  cssVars: {
    "--background": "#070b1a",
    "--foreground": "#e2e8f0",
    "--surface-app": "#070b1a",
    "--surface-sidebar": "rgba(15, 23, 42, 0.76)",
    "--surface-card": "rgba(15, 23, 42, 0.88)",
    "--surface-card-glass": "rgba(15, 23, 42, 0.72)",
    "--surface-overlay": "rgba(15, 23, 42, 0.82)",
    "--surface-hover": "rgba(99, 102, 241, 0.12)",
    "--border-soft": "rgba(129, 140, 248, 0.28)",
    "--border-strong": "rgba(129, 140, 248, 0.45)",
    "--text-strong": "#e2e8f0",
    "--text-muted": "#94a3b8",
    "--accent-foreground": "#0b1120",
    "--accent-ring": "rgba(99, 102, 241, 0.45)",
    "--accent-50": "#eef2ff",
    "--accent-100": "#e0e7ff",
    "--accent-200": "#c7d2fe",
    "--accent-300": "#a5b4fc",
    "--accent-400": "#818cf8",
    "--accent-500": "#6366f1",
    "--accent-600": "#4f46e5",
    "--accent-700": "#4338ca",
    "--accent-800": "#312e81",
    "--hero-from": "rgba(99, 102, 241, 0.12)",
    "--hero-to": "rgba(168, 85, 247, 0.08)",
  },
};

export const THEME_PALETTES = [skyPalette, auroraPalette, sunsetPalette, midnightPalette];

export const DEFAULT_THEME_ID = skyPalette.id;

export function findPalette(id: string): ThemePalette {
  return THEME_PALETTES.find((palette) => palette.id === id) ?? skyPalette;
}

type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : normalized.padEnd(6, "0");
  const int = parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`.toLowerCase();
}

function rgbaString({ r, g, b }: RGB, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getReadableForeground({ r, g, b }: RGB): string {
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? "#0f172a" : "#ffffff";
}

function mixColors(base: RGB, target: RGB, amount: number): RGB {
  return {
    r: Math.round(base.r + (target.r - base.r) * amount),
    g: Math.round(base.g + (target.g - base.g) * amount),
    b: Math.round(base.b + (target.b - base.b) * amount),
  };
}

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 0, g: 0, b: 0 };

export function generateAccentScale(baseHex: string): Record<string, string> {
  const baseRgb = hexToRgb(baseHex);
  const normalizedBaseHex = rgbToHex(baseRgb);

  const lightStops: Array<[string, number]> = [
    ["--accent-50", 0.92],
    ["--accent-100", 0.82],
    ["--accent-200", 0.65],
    ["--accent-300", 0.45],
    ["--accent-400", 0.25],
  ];

  const darkStops: Array<[string, number]> = [
    ["--accent-600", 0.18],
    ["--accent-700", 0.3],
    ["--accent-800", 0.45],
  ];

  const scale: Record<string, string> = {
    "--accent-500": normalizedBaseHex,
  };

  for (const [token, amount] of lightStops) {
    scale[token] = rgbToHex(mixColors(baseRgb, WHITE, amount));
  }

  for (const [token, amount] of darkStops) {
    scale[token] = rgbToHex(mixColors(baseRgb, BLACK, amount));
  }

  const accent400Rgb = hexToRgb(scale["--accent-400"] ?? normalizedBaseHex);
  scale["--accent-foreground"] = getReadableForeground(baseRgb);
  scale["--accent-ring"] = rgbaString(accent400Rgb, 0.4);

  return scale;
}
