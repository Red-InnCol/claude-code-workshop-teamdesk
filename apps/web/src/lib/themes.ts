// The one list of colour themes. The theme menu and the pre-paint init script
// in __root.tsx both read it, so they cannot drift apart. Each named theme's
// colours live in styles.css under :root[data-theme="<value>"].

export type ThemeBase = "light" | "dark";

export interface ThemeOption {
  /** "system" follows prefers-color-scheme. */
  base: ThemeBase | "system";
  /** Swatch shown in the menu. */
  dot: string;
  label: string;
  value: string;
}

export const THEMES = [
  { base: "system", dot: "#8a8681", label: "Auto", value: "auto" },
  { base: "light", dot: "#faf9f5", label: "Light", value: "light" },
  { base: "dark", dot: "#181818", label: "Dark", value: "dark" },
  { base: "light", dot: "#c8102e", label: "Santa Fe", value: "santafe" },
  { base: "dark", dot: "#6f4a2f", label: "Café", value: "cafe" },
  { base: "light", dot: "#1fb5ac", label: "Caribe", value: "caribe" },
  { base: "light", dot: "#8fa982", label: "Páramo", value: "paramo" },
  { base: "dark", dot: "#0f6b4c", label: "Esmeralda", value: "esmeralda" },
] as const satisfies readonly ThemeOption[];

export type ThemeValue = (typeof THEMES)[number]["value"];

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME: ThemeValue = "auto";

/** Theme value to its light/dark base; "system" for auto. */
const BASES: Record<string, ThemeOption["base"]> = Object.fromEntries(
  THEMES.map((theme) => [theme.value, theme.base])
);

export function isThemeValue(value: unknown): value is ThemeValue {
  return typeof value === "string" && Object.hasOwn(BASES, value);
}

export function resolveBase(
  value: ThemeValue,
  prefersDark: boolean
): ThemeBase {
  const base = BASES[value];
  if (base === "system") {
    return prefersDark ? "dark" : "light";
  }
  return base ?? "light";
}

/**
 * Sets the light/dark class (which `dark:` variants and useResolvedTheme read)
 * and data-theme (which selects the palette in styles.css). Auto has no
 * data-theme, so the plain .light/.dark palettes apply.
 */
export function applyTheme(value: ThemeValue) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const base = resolveBase(value, prefersDark);
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(base);
  if (value === "auto") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", value);
  }
  root.style.colorScheme = base;
}

/**
 * Inline script that runs before first paint, so a stored theme never flashes
 * the default one. Same logic as applyTheme, built from the same list.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var bases=${JSON.stringify(BASES)};var stored=window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var mode=Object.prototype.hasOwnProperty.call(bases,stored)?stored:${JSON.stringify(DEFAULT_THEME)};var base=bases[mode];if(base==='system'){base=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(base);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=base;}catch(e){}})();`;
