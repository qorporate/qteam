# QTeam: Product Flow and Technical Plan

## 1. Product

QTeam turns a list of outfield football players into positionally balanced teams.

The user controls:

- the players and their eligible positions;
- the number of teams;
- manual one-for-one swaps after generation.

QTeam controls:

- team sizes;
- each player's assigned position;
- the resulting formation of each team.

> Every player plays. The user chooses the number of teams; QTeam chooses the fairest available
> sizes and positional assignments.

QTeam balances positions, not player skill.

## 2. Platform

- Svelte 5 and SvelteKit
- Tailwind CSS
- `@sveltejs/adapter-static`
- GitHub Pages
- no backend or accounts

Everything runs in the browser. Player data stays on the device, and unfinished work survives a
reload through `localStorage`.

Use one SvelteKit route with internal screen state. This avoids GitHub Pages fallback routing and
makes direct reloads reliable beneath the repository base path.

## 3. User flow

```text
Players -> Team setup -> Teams
```

1. Add or import players.
2. Review the roster.
3. Choose a valid team count.
4. Generate teams.
5. Optionally swap players.
6. Copy or share the result.

Later screens are unavailable until their input is valid.

## 4. Players

The screen states:

> QTeam does not include goalkeepers. Add only outfield players.

QTeam supports exactly three positions:

```ts
type Position = 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
```

### 4.1 Import

Accept Qball's copied-player format, with or without numbering:

```text
1. Anuv Love - Forward
2. Oluwaseun Aladeyelu - Defender
3. Femi - Defender, Midfielder, Forward
```

```text
Anuv Love - Forward
Oluwaseun Aladeyelu - DF
Femi - Midfielder, Forward
```

For each non-empty line:

1. Remove optional numbering such as `1.`, `1)` or `1 -`.
2. Split on the final spaced hyphen, ` - `.
3. Trim the name.
4. Split the position part on commas.
5. Trim and case-fold each token.
6. Map complete tokens to a canonical position.

Fixed aliases:

| Position | Accepted tokens |
|---|---|
| Defender | `Defender`, `Defence`, `Def`, `DF`, `D` |
| Midfielder | `Midfielder`, `Midfield`, `Mid`, `MF`, `M`, `CM` |
| Forward | `Forward`, `Attack`, `Attacker`, `FW`, `F`, `ST`, `CF` |

The parser returns valid players and line-numbered errors. It never guesses a position, discards a
valid line because another line failed, or merges duplicate names.

The screen shows the valid count and errors before the user adds the import. Adding an import
appends valid players to the roster and leaves invalid lines available for correction.

Configurable aliases are deferred until real imports show that the fixed list is insufficient.

### 4.2 Manual entry

The form contains:

- player name;
- Defender, Midfielder, and Forward toggles;
- Add player.

Trim names before storage. A player requires a name and at least one position.

### 4.3 Roster

Each row contains:

- editable name;
- editable position chips;
- Remove.

Show the total player count and validation errors. Additional position summaries are unnecessary
for the first release.

The user can continue when:

- there are at least eight players;
- every player has a name;
- every player has at least one position.

Eight is the minimum for two teams of four.

Changing the roster after generation requires confirmation and then discards the generated result.
Never show teams that do not match the current roster.

## 5. Team setup

The user chooses only the number of teams.

For `playerCount` players and `teamCount` teams:

```ts
const baseSize = Math.floor(playerCount / teamCount);
const largerTeamCount = playerCount % teamCount;

const teamSizes = Array.from(
  { length: teamCount },
  (_, index) => baseSize + (index < largerTeamCount ? 1 : 0)
);
```

A team count is valid when:

```text
teamCount >= 2
smallest team size >= 4
largest team size <= 10
```

Show only valid options and preview their calculated sizes. With a valid roster of eight or more
players, at least one valid option always exists.

Example for 31 players:

```text
4 teams: 8, 8, 8, 7
```

There are no substitutes.

## 6. Generation

The generator is a pure function. It does not read Svelte state, the DOM, storage, or
`Math.random()` directly.

```ts
type GenerateTeamsInput = {
  players: Player[];
  teamCount: number;
  seed: string;
};

type GenerateTeamsResult =
  | { ok: true; seed: string; teams: GeneratedTeam[]; warnings: string[] }
  | { ok: false; issues: string[] };
```

Use a seeded random source so the same input and seed always returns the same result. Generate
another creates a new seed.

### 6.1 Hard rules

Every successful result satisfies:

1. Every input player appears exactly once.
2. No unknown player appears.
3. The requested number of teams is returned.
4. Team sizes equal the calculated sizes.
5. Team sizes differ by at most one.
6. Every assigned position is eligible for that player, except a midfielder or forward may fill a
   defender slot when the roster has too few defenders.
7. Each displayed formation matches its assigned positions.

Balance preferences may never violate these rules.

### 6.2 First algorithm

Start with the smallest deterministic heuristic that produces credible teams:

1. Use these preferred formations for teams of four through ten outfield players:

   ```text
   4: 1-2-1  5: 2-2-1  6: 2-2-2  7: 3-2-2
   8: 3-3-2  9: 3-3-3  10: 4-3-3
   ```

2. Fill each team's defender slots first. Use eligible defenders, then midfielders, then forwards.
3. Sort the remaining players by flexibility: one eligible position first, then two, then three.
4. Use the seed to shuffle only equally constrained players and break ties.
5. Prefer the remaining formation position with the largest gap, then the least-full team.
6. Derive formations and warnings from the finished assignments.

Do not add an optimizer, weighted score, or improvement pass until named fixtures demonstrate a
real weakness in this algorithm.

Generation is the best available positional balance, not a mathematical optimum.

### 6.3 Warnings

Generation still succeeds when the roster cannot cover every position on every team.

Examples:

```text
Team C has no assigned defender.
Only two defenders were available for four teams.
```

Warnings are derived from the roster and current assignments. They are not persisted.

## 7. Teams

Each team shows:

- team name;
- player count;
- derived formation;
- players grouped by assigned position.

Team names default to Team A, Team B, and so on. Custom names are deferred.

### 7.1 Swaps

Swaps are one-for-one between different teams, so sizes remain valid.

1. Select a player.
2. Select a player on another team.
3. Confirm if the swap adds a coverage warning.
4. Apply the swap and recalculate formations and warnings.

Assigned positions move with the players and remain valid, including the defensive fallback.
Automatic reassignment of other players is deferred until real use shows it is needed.

The user may accept a positionally worse swap. Drag-and-drop, undo history, and a stored baseline
are not part of the first release. Generate another remains available.

### 7.2 Copy and share

Support:

- Copy all teams.
- Copy one team.
- Use the Web Share API when available.

Example:

```text
TEAM A — 3-3-2

Defenders
1. Anuv Love
2. Mark
3. Tema

Midfielders
4. Femi
5. Henry
6. Mayor

Forwards
7. Teslim
8. Jet Victor
```

Formatting is a pure function. Copy remains available when native sharing is unavailable or
cancelled.

## 8. Data model

Store only source state. Derive capacities, formations, scores, and warnings.

```ts
type Position = 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

type Player = {
  id: string;
  name: string;
  eligiblePositions: Position[];
};

type AssignedPlayer = {
  playerId: string;
  assignedPosition: Position;
};

type GeneratedTeam = {
  id: string;
  players: AssignedPlayer[];
};

type GeneratedResult = {
  seed: string;
  teams: GeneratedTeam[];
};

type Workspace = {
  schemaVersion: 1;
  screen: 'players' | 'setup' | 'teams';
  roster: Player[];
  teamCount?: number;
  generated?: GeneratedResult;
};
```

Use `crypto.randomUUID()` for player IDs. Teams refer to players by ID; the roster remains the
source of names and eligible positions.

## 9. Persistence

Use one key:

```text
qteam.workspace.v1
```

One document keeps roster and generated state atomic. A separate preferences document is
unnecessary without configurable settings.

Rules:

- Decode stored JSON explicitly before using it.
- Treat storage as untrusted input.
- Ignore malformed or unsupported data safely and explain the reset.
- Save after state-changing actions.
- Catch storage errors without crashing the application.
- Do not persist open menus, messages, selections, import text, formations, or warnings.
- Start over clears the workspace after confirmation.

Keep `schemaVersion`, but write a migration only when a second schema exists. Do not scaffold a
migration system in advance.

`localStorage` is sufficient for the expected data size.

## 10. Code boundaries

Start with a few feature files:

```text
src/lib/players.ts
src/lib/teams.ts
src/lib/storage.ts
src/lib/sharing.ts
src/lib/workspace.svelte.ts
src/routes/+layout.svelte
src/routes/+page.svelte
```

Pure parsing, sizing, generation, swapping, and formatting functions stay outside Svelte
components. Split a file only when it becomes difficult to navigate or has a second reason to
change.

## 11. Tests

Use:

- Vitest for pure functions.
- Playwright for primary browser journeys.

Do not add property-testing or component-testing dependencies until ordinary tests cannot express
the required behaviour.

### 11.1 Unit tests

Parser:

- numbered and unnumbered lines;
- multiple positions and aliases;
- whitespace and casing;
- hyphenated and position-like names;
- duplicate names;
- mixed valid and invalid lines;
- missing names, separators, or positions;
- unknown positions;
- no fallback position.

Team sizes:

```ts
[
  { players: 8, teams: 2, sizes: [4, 4], valid: true },
  { players: 31, teams: 4, sizes: [8, 8, 8, 7], valid: true },
  { players: 32, teams: 3, sizes: [11, 11, 10], valid: false },
  { players: 32, teams: 8, sizes: [4, 4, 4, 4, 4, 4, 4, 4], valid: true },
  { players: 32, teams: 9, sizes: [4, 4, 4, 4, 4, 3, 3, 3, 3], valid: false }
]
```

Generator:

- run every hard-rule assertion against representative and generated rosters;
- cover all seven non-empty eligible-position combinations;
- confirm identical input and seed returns an identical result;
- confirm inputs are not mutated;
- include fixtures for scarce defenders, unequal sizes, and flexible players.

Swaps:

- reject the same team and unknown IDs;
- preserve sizes and membership;
- keep assigned positions eligible;
- recalculate formations and warnings.

Persistence:

- valid workspace round-trip;
- invalid JSON and invalid fields are rejected safely;
- storage failures leave in-memory state usable;
- browser storage is not read during the static build.

Sharing:

- one and several teams;
- unequal sizes;
- duplicate names;
- all position headings.

### 11.2 Browser journeys

Keep the Playwright suite small:

1. Import a mixed-validity Qball list, correct it, choose teams, generate, copy, and reload.
2. Add eight players manually, generate, swap two players, and start over.
3. Load the production build beneath `/qteam` and complete the primary flow.

Test behaviour and invariants, not implementation details or large snapshots. Add a regression
test before fixing a reported bug.

CI runs:

```text
bun run lint
bun run check
bun run test
bun run build
bun run test:e2e
```

## 12. Delivery

Each version remains deployable and testable.

### Version 0: Foundation

- SvelteKit, Tailwind, and static adapter
- GitHub Pages base path
- app shell and single-route navigation
- CI, Vitest, and Playwright harnesses

Done when the production build and smoke test pass beneath `/qteam`.

### Version 1: Players

- import parser with fixed aliases
- manual entry
- roster editing and validation
- one persisted workspace
- Start over

Done after real Qball lists import correctly and a reload preserves edits.

### Version 2: Team setup

- valid team counts
- calculated size preview
- navigation guards

Done after boundary tests and real indivisible rosters such as 25, 29, and 31 players.

### Version 3: Generate teams

- seeded deterministic generator
- hard-rule validation
- minimal positional balancing
- team cards, formations, warnings, and Generate another

Done when generated and named fixture rosters satisfy every hard rule and look positionally
credible.

### Version 4: Manual swaps

- tap-to-select swap flow
- confirmation when coverage worsens
- persisted swaps

Done after mobile and desktop tap flows preserve all hard rules.

### Version 5: Sharing and release

- Copy one and Copy all
- optional native Share
- accessibility and responsive pass
- production deployment smoke test

Done after copied output is readable in WhatsApp and the complete flow works on a real mobile
browser.

## 13. Definition of done

- A real Qball list imports without data loss.
- Only valid team counts are offered.
- Every generated and swapped result satisfies the hard rules.
- Weak rosters generate honest warnings.
- The same seed reproduces the same result.
- Reload restores the workspace.
- Copy output is readable in WhatsApp.
- The GitHub Pages build and CI pass.

## 14. Non-goals

- goalkeepers or substitutes;
- skill ratings;
- configurable import aliases;
- user-selected or preferred formations;
- drag-and-drop swaps;
- undo history or saved baselines;
- accounts, cloud sync, or collaboration;
- saved match history;
- offline/PWA support;
- Qball backend integration;
- claims of mathematical or skill balance.
