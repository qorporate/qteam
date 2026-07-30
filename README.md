# QTeam

QTeam turns a list of outfield football players into positionally balanced teams. It is a
browser-only SvelteKit application: player data stays on the user's device.

## Development

Requires Bun.

```sh
bun run dev
```

Before opening a pull request:

```sh
bun run lint
bun run check
bun run test
bunx playwright install chromium
bun run test:e2e
```

`main` is built and deployed to GitHub Pages by `.github/workflows/pages.yml`. The production
build uses `/qteam` as its base path.
