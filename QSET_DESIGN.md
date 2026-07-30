# QSet design system

Source: [QSet, node 112:3671](https://www.figma.com/design/riK1li5IJc4G98SFOPzQte/QSet?node-id=112-3671&t=01MOYl19UjLOESv1-0), reviewed 2026-07-30.

This is the smallest shared system evidenced by the supplied mobile screens. It covers the match, table, history, setup, dialog, preview, and guided-tour flows. Values marked **normalized** consolidate near-duplicate Figma values into one implementation token.

## Principles

- Keep the match state readable at a glance.
- Use green for progress and positive actions, black for strong contrast, and gray for structure.
- Build screens from simple white surfaces on a quiet gray canvas.
- Prefer obvious labels beside icons for uncommon actions.
- Keep secondary controls visually quiet so scores, teams, timer, and primary actions lead.

## Foundations

### Color

| Token | Value | Use |
|---|---:|---|
| `--color-brand` | `#4CAF50` | Primary actions, active accents, Team 1, success |
| `--color-brand-soft` | `rgba(76, 175, 80, 0.12)` | Selected rows and subtle action backgrounds |
| `--color-brand-faint` | `rgba(76, 175, 80, 0.08)` | Current table row and low-emphasis highlights |
| `--color-ink` | `#171717` | Default text |
| `--color-black` | `#000000` | Team 2, high-contrast actions, overlays |
| `--color-muted` | `#757575` | Secondary text and controls |
| `--color-subtle` | `#A5A5A5` | Inactive navigation |
| `--color-disabled` | `#CCCCCC` | Disabled text and icons |
| `--color-canvas` | `#F7F7F7` | App background |
| `--color-surface-muted` | `#F5F5F5` | Inputs, tabs, icon-button backgrounds |
| `--color-surface-strong` | `#F0F0F0` | Nested controls and neutral highlights |
| `--color-surface` | `#FFFFFF` | Cards, header, dialogs |
| `--color-warning` | `#FF8B25` | Queue guidance and streak indicator |
| `--color-warning-soft` | `rgba(255, 139, 37, 0.12)` | Warning/guidance background |
| `--color-danger` | `#FF4D4F` | Destructive actions and stop state; **normalized** from the rendered screens |
| `--color-danger-soft` | `rgba(255, 77, 79, 0.12)` | Reset/destructive background; **normalized** |
| `--color-scrim` | `rgba(0, 0, 0, 0.68)` | Dialog and guided-tour backdrop; **normalized** |

Do not use brand green as decoration. Reserve it for a selected state, forward action, success, or Team 1 identity. Pair color with text or an icon; color alone must not communicate state.

### Typography

Use Ubuntu throughout the product. Fall back to a system sans-serif while it loads.

```css
font-family: Ubuntu, ui-sans-serif, system-ui, sans-serif;
```

| Token | Size / line height | Weight | Use |
|---|---:|---:|---|
| `--type-display` | `40px / 40px` | 500 | Match timer |
| `--type-title` | `24px / 29px` | 500 | Dialog and page titles |
| `--type-section` | `20px / 24px` | 500 | Team names and major section values |
| `--type-heading` | `18px / 22px` | 500 | Card headings |
| `--type-body-strong` | `16px / 20px` | 500 | Tabs, buttons, emphasized body |
| `--type-body` | `16px / 20px` | 400 | Default copy and controls |
| `--type-small` | `14px / 20px` | 400 | Supporting text, table content |
| `--type-small-strong` | `14px / 20px` | 700 | Compact emphasis |
| `--type-caption` | `12px / 16px` | 400 | Dense metadata only; **normalized** |

Use sentence case for interface labels (`Set time`, `Add teams`). Outcome buttons may use uppercase team names when space is tight (`TEAM 1 Wins`). Use tabular numerals for timers, scores, and table columns.

### Spacing and sizing

The layout follows a 4 px base grid.

| Token | Value | Typical use |
|---|---:|---|
| `--space-1` | `4px` | Tight icon/text gaps |
| `--space-2` | `8px` | Compact gaps and padding |
| `--space-3` | `12px` | Control padding and row gaps |
| `--space-4` | `16px` | Card padding and standard section gaps |
| `--space-5` | `20px` | Large internal gaps |
| `--space-6` | `24px` | Page sections and dialog groups |

- Mobile reference width: `430–438px`.
- Page gutter: `20px`.
- Main content width: viewport minus `40px`; Figma examples are `385–387px`.
- Standard header height: `60px`.
- Standard tab bar height: `48px`.
- Minimum interactive target: `44 × 44px`, even when the visible icon is `16–28px`.
- Keep content in one column. Use two columns only for the paired team cards.

### Shape and elevation

| Token | Value | Use |
|---|---:|---|
| `--radius-sm` | `8px` | Buttons, inputs, row highlights |
| `--radius-md` | `12px` | Icon controls, menus, dialogs |
| `--radius-lg` | `16px` | Cards, header, tab container |
| `--radius-xl` | `20px` | Paired-team stage |
| `--radius-pill` | `999px` | Circular and pill controls |
| `--shadow-overlay` | `0 0 32px rgba(0, 0, 0, 0.12)` | Floating menus and dialogs |

Default cards are flat. Use elevation only when one surface floats above another. Guided tours blur the underlying interface by about `4–6px` beneath the scrim.

## Layout

The default screen stack is:

1. A white 60 px app header.
2. A three-item segmented navigation for `Match`, `Table`, and `History`.
3. Page content, separated by 16–24 px.
4. White cards with 16 px padding and 16 px radius.

Use flex/grid flow rather than fixed coordinates. The Safari and iOS status bars in the source are presentation mockups, not product components. Respect `env(safe-area-inset-*)` when the app runs standalone.

On wider screens, center the mobile column and cap it at `438px` until a desktop layout is designed. Do not stretch cards into an unvalidated desktop dashboard.

## Components

### App header

- White surface, `60px` high, `16px 20px` padding, `16px` radius.
- QTeam wordmark: bold `24px`; “Q” uses ink and “Set” uses brand green.
- Actions sit on the right as circular muted-surface icon buttons.

### Segmented navigation

- White container, `4px` padding, `16px` radius, `48px` high.
- Three equal-width tabs.
- Active tab: muted surface, ink text, medium weight.
- Inactive tab: transparent surface, subtle text, regular weight.
- Use correct tab semantics and expose the selected state to assistive technology.

### Card

- White background, `16px` radius, no default shadow.
- Default padding and gap: `16px`.
- Nested areas may use `#F5F5F5` with `8–20px` radius to group related controls.

### Team card

- Two equal cards inside a muted stage.
- Center the team mark and name; keep edit as a trailing icon action.
- Team 1 uses brand green and Team 2 uses black. The identity must also be present in the name, mark, or position.
- A streak badge uses warning orange on `--color-warning-soft`.

### Button

| Variant | Background | Foreground | Use |
|---|---|---|---|
| Primary | Brand | White | Confirm, continue, set, download |
| Contrast | Black | White | Team 2 outcome, return to match |
| Neutral | Muted surface | Ink | Draw, cancel, secondary actions |
| Quiet | Transparent or soft brand | Ink/muted | Set time, reset, previous |
| Danger | Danger soft | Danger | Reset game, remove team |

- Default radius: `8px`.
- Default padding: `10–12px 12–20px`.
- Minimum height: `44px` for standalone actions. Compact controls shown at `36px` must retain a 44 px hit area.
- Disabled: disabled foreground on a muted surface; do not rely on opacity alone.
- Focus: visible `2px` outline with `2px` offset. Use ink on light backgrounds and white on dark overlays.

### Icon button

- Visible container: commonly `36–48px`; hit target at least `44px`.
- Icon: `16–28px`.
- Use muted-surface circular buttons for utility actions.
- Every icon-only button needs an accessible name.

### Input

- White or muted surface, `1px` neutral border, `8px` radius.
- Compact field padding: `8–12px`.
- Label fields explicitly; placeholder text is an example, not the label.
- Focus border and ring use brand green.
- Place a trailing add button only when its relationship to the field is unambiguous.

### Queue row

- White/muted row, `12px` padding, `8–12px` radius.
- Selected/current row uses brand soft or faint background.
- Team name leads; overflow menu trails.
- Menus are white, `12px` radius, `--shadow-overlay`, with Edit and Remove actions. Destructive items use danger color.

### Timer

- Card heading at `18px` medium.
- Time at `40px` medium with tabular numerals.
- Start and stop are separate icon controls with accessible names.
- Put `Set time` and `Reset` beneath the main timer as quiet actions.

### Table

- Use a native table where possible.
- Left-align team names; right-align numeric statistics.
- Compact text is `12–14px`.
- Highlight the current match row with brand faint and use brand ink/bold text for the points column.
- Do not remove headers visually unless equivalent accessible labels remain.

### History list

- One result per row with order number, sentence-style outcome, and subdued time.
- Bold team names, not the whole sentence.
- Separate rows with spacing or a subtle divider, not card shadows.

### Dialog and bottom sheet

- Use the platform dialog/top-layer where available.
- Mobile dialogs appear as bottom sheets with a white surface, `12–16px` top radius, and a dark scrim.
- Padding and group gap: `16–24px`.
- Keep one clear primary action and one neutral cancel action.
- Trap focus, close on Escape where appropriate, restore focus to the trigger, and do not close destructive dialogs without confirmation.

### Guided tour

- Dark scrim with the relevant live component left clear or shown in a white callout.
- Tour copy uses a centered white title and muted-white supporting text.
- `Next` is brand green; `Previous` is a subdued pill.
- Provide a persistent close control and never block access to the product for returning users.
- Blur is decorative; the scrim must provide sufficient contrast without it.

## Interaction states

Every interactive component must define:

- `default`
- `hover` where hover exists
- `active/pressed`
- `focus-visible`
- `disabled`
- `loading` when an action can take noticeable time
- `error` for inputs and failed operations

Use a short `120–180ms` transition for color and opacity. Do not animate layout-critical match data. Respect `prefers-reduced-motion`.

## Accessibility

- Meet WCAG 2.2 AA contrast: `4.5:1` for normal text and `3:1` for large text and meaningful graphics.
- White text on `#4CAF50` does not meet `3:1`, even for large text. Use ink text, or darken interactive green to at least approximately `#2E7D32` when white text is required.
- `#A5A5A5` and `#CCCCCC` are too light for essential text on white; reserve them for disabled or nonessential content.
- Preserve a logical heading order and DOM order.
- Announce timer changes and match results without moving focus; avoid announcing every elapsed second.
- Use native buttons, inputs, tables, and dialogs before adding ARIA.

## Implementation tokens

These variables are enough to implement the documented system; add a token only after the same new value appears in more than one component.

```css
:root {
  --color-brand: #4caf50;
  --color-brand-soft: rgb(76 175 80 / 12%);
  --color-brand-faint: rgb(76 175 80 / 8%);
  --color-ink: #171717;
  --color-black: #000;
  --color-muted: #757575;
  --color-subtle: #a5a5a5;
  --color-disabled: #ccc;
  --color-canvas: #f7f7f7;
  --color-surface-muted: #f5f5f5;
  --color-surface-strong: #f0f0f0;
  --color-surface: #fff;
  --color-warning: #ff8b25;
  --color-warning-soft: rgb(255 139 37 / 12%);
  --color-danger: #ff4d4f;
  --color-danger-soft: rgb(255 77 79 / 12%);
  --color-scrim: rgb(0 0 0 / 68%);

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 999px;
  --shadow-overlay: 0 0 32px rgb(0 0 0 / 12%);
}
```

## Deliberate limits

- Light theme only: no dark theme is evidenced by this node.
- Mobile only: wider layouts should center the mobile column until designed.
- No separate token package or component API is specified; this repository does not need one yet.
- Product icons should come from one consistent installed icon set. The mixed Font Awesome, Material, Fluent, and custom icon names in Figma describe intent, not a requirement to ship four libraries.
