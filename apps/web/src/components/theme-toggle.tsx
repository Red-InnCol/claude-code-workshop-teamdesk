import { Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
  applyTheme,
  DEFAULT_THEME,
  isThemeValue,
  THEME_STORAGE_KEY,
  THEMES,
  type ThemeValue,
} from "#/lib/themes";

function readStoredTheme(): ThemeValue {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeValue(stored) ? stored : DEFAULT_THEME;
  } catch {
    // Storage can be blocked (private windows). Fall back to the default.
    return DEFAULT_THEME;
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeValue>(DEFAULT_THEME);

  useEffect(() => {
    const initial = readStoredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    if (theme !== "auto") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("auto");

    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [theme]);

  function selectTheme(value: string) {
    if (!isThemeValue(value)) {
      return;
    }
    setTheme(value);
    applyTheme(value);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch {
      // Not saved; the theme still applies for this visit.
    }
  }

  const current = THEMES.find((option) => option.value === theme) ?? THEMES[0];
  const label = `Theme: ${current.label}. Choose a theme.`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={label}
          size="sm"
          title={label}
          type="button"
          variant="outline"
        >
          <Palette />
          {current.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup onValueChange={selectTheme} value={theme}>
          {THEMES.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full ring-1 ring-foreground/20"
                style={{ backgroundColor: option.dot }}
              />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
