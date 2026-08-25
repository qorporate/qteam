# QTeam design system

Status: foundational system, version 0.1.

QTeam inherits QSet's visual language—Ubuntu type, green and black accents, soft gray surfaces, compact controls, and rounded geometry—but not its product-specific components or layouts. See `QSET_DESIGN.md` for the source system.

This document is the source of truth for QTeam. Add product patterns only after they exist in QTeam in at least two places.

## Direction

QTeam should feel:

- clear before clever;
- friendly without becoming playful;
- compact without feeling cramped;
- calm by default, with strong actions easy to find;
- useful on small screens and comfortable on larger ones.

Use green for progress, positive actions, and selected states. Use black for high contrast and emphasis. Let white and soft gray surfaces carry most of the interface.

## Foundations

### Color

| Token | Value | Use |
|---|---:|---|
| `--color-brand` | `#4CAF50` | Brand, primary actions, positive and selected states |
| `--color-brand-soft` | `rgb(76 175 80 / 12%)` | Selected rows, badges, subtle action backgrounds |
| `--color-brand-faint` | `rgb(76 175 80 / 8%)` | Low-emphasis highlights |
| `--color-ink` | `#171717` | Default text and icons |
| `--color-black` | `#000000` | Highest-emphasis surfaces and actions |
| `--color-muted` | `#666666` | Secondary text that remains readable on light surfaces |
| `--color-subtle` | `#A5A5A5` | Nonessential metadata and inactive decoration |
| `--color-disabled` | `#CCCCCC` | Disabled content |
| `--color-canvas` | `#F7F7F7` | App background |
| `--color-surface-muted` | `#F5F5F5` | Inputs, control groups, subtle sections |
| `--color-surface-strong` | `#F0F0F0` | Pressed and nested neutral surfaces |
| `--color-surface` | `#FFFFFF` | Cards, menus, dialogs |
| `--color-warning` | `#FF8B25` | Warnings and attention |
| `--color-warning-soft` | `rgb(255 139 37 / 12%)` | Warning background |
| `--color-danger` | `#D32F2F` | Errors and destructive actions |
| `--color-danger-soft` | `rgb(211 47 47 / 10%)` | Error and destructive background |
| `--color-scrim` | `rgb(0 0 0 / 68%)` | Modal backdrop |

Rules:

- Brand green is semantic, not decoration.
- Pair status color with text or an icon.
- Keep most surfaces neutral so state changes remain obvious.
- Use `--color-ink` on brand green. White on `#4CAF50` does not meet WCAG contrast requirements.
- Reserve subtle and disabled colors for nonessential or unavailable content.

### Typography

Use Ubuntu throughout QTeam, with the system sans-serif as fallback.

```css
font-family: Ubuntu, ui-sans-serif, system-ui, sans-serif;
```

| Token | Size / line height | Weight | Use |
|---|---:|---:|---|
| `--type-display` | `40px / 44px` | 500 | Rare hero values |
| `--type-title` | `24px / 30px` | 500 | Page and dialog titles |
| `--type-section` | `20px / 26px` | 500 | Section headings |
| `--type-heading` | `18px / 24px` | 500 | Card headings |
| `--type-body-strong` | `16px / 22px` | 500 | Buttons and emphasized body text |
| `--type-body` | `16px / 24px` | 400 | Default copy and controls |
| `--type-small` | `14px / 20px` | 400 | Supporting text and dense UI |
| `--type-small-strong` | `14px / 20px` | 700 | Compact emphasis |
| `--type-caption` | `12px / 16px` | 400 | Nonessential metadata |

Use sentence case. Keep labels short and direct. Use tabular numerals for comparable numeric values.

### Spacing

Use a 4 px base grid.

| Token | Value |
|---|---:|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |

- Use `8–12px` inside compact controls.
- Use `16px` inside cards and between related elements.
- Use `24–32px` between sections.
- Let parent containers own spacing. Prefer flex or grid `gap` and padding.
- Avoid margins for component layout unless the spacing cannot reasonably belong to a parent.
- Prefer spacing over divider lines.
- Minimum interactive target: `44 × 44px`.

### Shape and elevation

| Token | Value | Use |
|---|---:|---|
| `--radius-sm` | `8px` | Buttons, inputs, compact highlights |
| `--radius-md` | `12px` | Menus, icon controls, dialogs |
| `--radius-lg` | `16px` | Cards and major surfaces |
| `--radius-xl` | `20px` | Large grouped surfaces |
| `--radius-pill` | `999px` | Pills and circular controls |
| `--shadow-overlay` | `0 0 32px rgb(0 0 0 / 12%)` | Menus and dialogs |

Cards are flat by default. Use a shadow only when a surface floats above another.

## Layout

- Design mobile-first, then let content determine wider layouts.
- Use normal document flow, flex, and grid; avoid fixed coordinates.
- Default page gutter: `16px` on small screens, `24px` from `640px`, and `32px` from `1024px`.
- Center reading and form content rather than stretching it across wide screens.
- Let data-heavy views use the width they need.
- Keep primary actions near the content they affect.
- Respect safe-area insets on installed mobile experiences.

Do not define a permanent sidebar, header, dashboard grid, or breakpoint-specific navigation until QTeam's information architecture is known.

## Core controls

These controls are shared UI primitives, not QSet product components.

### Button

| Variant | Background | Foreground | Use |
|---|---|---|---|
| Primary | Brand | Ink | Main action |
| Contrast | Black | White | Strong alternate action |
| Neutral | Surface muted | Ink | Secondary action |
| Quiet | Transparent | Ink or muted | Low-emphasis action |
| Danger | Danger soft | Danger | Destructive action |

- Height: at least `44px`.
- Padding: `10px 16px`.
- Radius: `8px`.
- Gap between icon and label: `8px`.
- Use one primary action per decision area.
- Use a verb that describes the result.
- Loading buttons retain their width and label context.
- Disabled buttons remain legible and are not the only explanation for why an action is unavailable.

### Icon button

- Hit target: at least `44 × 44px`.
- Icon: `20–24px`.
- Use a muted circular or rounded-square surface for utility actions.
- Give every icon-only control an accessible name and tooltip where the icon may be unfamiliar.

### Field

- Use a visible label; placeholder text is optional help.
- Height: at least `44px`.
- Padding: `10–12px`.
- Surface: white or surface muted.
- Border: `1px` neutral border.
- Radius: `8px`.
- Focus uses a visible, contrast-safe ring; pair the brand ring with an ink outline when needed.
- Put help and validation text directly beneath the field.
- Explain how to fix an error, not only that one occurred.

### Card

- White surface, `16px` radius, no default shadow.
- Padding: `16px` on small screens and up to `24px` when space allows.
- Use one card for one coherent idea or task.
- Avoid cards nested inside cards; use a muted section inside a card when grouping is needed.

### Badge

- Use for short statuses or categories, never actions.
- Use a soft semantic background with readable text.
- Radius: pill.
- Padding: `4px 8px`.
- Include a text label; color alone is insufficient.

### Dialog

- Use the native dialog/top layer where available.
- White surface, `12–16px` radius, dark scrim.
- Padding and group gap: `16–24px`.
- Keep one clear primary action and a neutral cancel action.
- On small screens, a dialog may become a bottom sheet.
- Trap focus, support Escape where safe, and restore focus to the trigger.
- Confirm actions that are destructive or difficult to undo.

### Feedback

- Success confirms completion without interrupting the next task.
- Warnings explain risk before the action.
- Errors stay close to their source and include recovery.
- Use toasts only for brief outcomes that do not require a decision.
- Do not use color as the only signal.

## Interaction

Every interactive control needs:

- default;
- hover when supported;
- active/pressed;
- focus-visible;
- disabled;
- loading when an action may take noticeable time;
- error where failure is possible.

Use `120–180ms` transitions for color, opacity, and small transforms. Avoid animating layout-critical content. Respect `prefers-reduced-motion`.

## Accessibility

- Meet WCAG 2.2 AA: `4.5:1` for normal text and `3:1` for large text and meaningful graphics.
- Use native HTML controls before ARIA.
- Preserve logical DOM, focus, and heading order.
- Keep touch targets at least `44 × 44px`.
- Make focus visible on every interactive element.
- Do not hide essential information in hover, color, animation, or placeholder text.
- Announce important asynchronous results without moving focus.
- Validate the final foreground/background pair; token names alone do not guarantee contrast.

## Implementation tokens

```css
:root {
  color-scheme: light;

  --color-brand: #4caf50;
  --color-brand-soft: rgb(76 175 80 / 12%);
  --color-brand-faint: rgb(76 175 80 / 8%);
  --color-ink: #171717;
  --color-black: #000;
  --color-muted: #666;
  --color-subtle: #a5a5a5;
  --color-disabled: #ccc;
  --color-canvas: #f7f7f7;
  --color-surface-muted: #f5f5f5;
  --color-surface-strong: #f0f0f0;
  --color-surface: #fff;
  --color-warning: #ff8b25;
  --color-warning-soft: rgb(255 139 37 / 12%);
  --color-danger: #d32f2f;
  --color-danger-soft: rgb(211 47 47 / 10%);
  --color-scrim: rgb(0 0 0 / 68%);

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 999px;
  --shadow-overlay: 0 0 32px rgb(0 0 0 / 12%);
}
```

Add tokens only when a repeated QTeam need appears. Do not create aliases, themes, or a separate token package until the product requires them.

## Not defined yet

The following depend on QTeam's product model and should be documented when its real screens exist:

- app shell and navigation;
- domain-specific cards and lists;
- empty, onboarding, and first-run experiences;
- data visualization;
- responsive behavior for real workflows;
- dark theme;
- motion beyond control feedback.
