# Spec: five extra colour themes

Status: ready to build · Target: about 20 minutes · Date: 2026-11-17

## Goal

Add five colour themes next to Light, Dark and Auto, and replace the cycling theme button with a dropdown menu.

## Themes

Each theme changes colours only (CSS variables). Fonts, spacing and layout don't change. Exception: Santa Fe also swaps the header name and adds a red top edge to cards.

| Value (`data-theme`) | Name | Base | Look |
|---|---|---|---|
| `light` | Light | light | unchanged |
| `dark` | Dark | dark | unchanged |
| `auto` | Auto | follows system | unchanged |
| `santafe` | Santa Fe | light | Half red, half white: white page, red header and footer bands, red-topped cards, red buttons. Header name becomes "Independiente Santa Fe Teamdesk" |
| `cafe` | Café | dark | Espresso-brown page, cream text, caramel primary |
| `caribe` | Caribe | light | Sand page, turquoise accents, coral primary |
| `paramo` | Páramo | light | Misty grey-green page, sage accents, pale yellow highlights |
| `esmeralda` | Esmeralda | dark | Deep emerald page, gold primary |

The builder picks the exact colour values. They aren't official club or brand values. All text must pass WCAG AA contrast (4.5:1), including `--primary-foreground` on `--primary` and `--muted-foreground` on `--background`.

## Behaviour

- The header button opens a dropdown (`components/ui/dropdown-menu.tsx`) listing all 8 options. Each option shows a small colour dot and its name, and the current option is marked as selected.
- The trigger button shows the current theme's name.
- The choice is saved in `localStorage` under the existing `theme` key, so it's per browser, as today. No database, API or migration changes.
- Unknown or missing stored values fall back to `auto`.
- No flash of the wrong theme on page load.

## Implementation notes

- On `<html>`, keep the `light` / `dark` class set from the theme's base, and set `data-theme` to the theme value (as now for light/dark). Reason: 24 `components/ui` files use `dark:` variants, and `use-resolved-theme.ts` reads the class (for example for the toaster), so dark-based themes need the `dark` class.
- In `styles.css`, add one `:root[data-theme="<value>"]` block per new theme after the `.dark` block, overriding the same variables `.light` / `.dark` set (including `--brand-label` and `--chart-*`). The extra specificity makes them win over `.light` / `.dark`.
- Theme logic currently lives in two places that must agree: `components/theme-toggle.tsx` and `THEME_INIT_SCRIPT` in `routes/__root.tsx`. Define the theme list (value, label, base, dot colour) once and build the init script's allowed values from it, so the two can't drift.
- `use-resolved-theme.ts` needs no change.

## Out of scope

- Saving the theme per team member or across devices.
- Font, spacing or layout changes per theme.
- A settings page.

## Done when

- [ ] All 8 options appear in the dropdown and each applies immediately.
- [ ] The choice survives a page reload; no flash of another theme on load.
- [ ] Café and Esmeralda render `dark:` styles correctly (pop-up messages, inputs, dialogs).
- [ ] Contrast checked to AA for every new theme on the bookings, tasks and team pages.
- [ ] `bun run check` and `bun test` pass.
