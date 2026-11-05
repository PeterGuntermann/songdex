# Songdex.Frontend

Frontend-specific guidance; the repo-wide rules are in the root `CLAUDE.md`.

## Tests

Tests run on **Vitest** through Angular's first-party `@angular/build:unit-test` builder — there is
no `vitest.config.ts` and no setup file. The builder derives the Vitest config from the `build`
target (`runnerConfig` is left at its `false` default), so specs are compiled by the same esbuild
pipeline as the app. Go through `ng test`, never bare `npx vitest`: without the builder there is no
config at all and nothing resolves.

Because the `build` target lists `zone.js` in `polyfills`, the builder automatically appends
`zone.js/testing` and initialises the `TestBed` with the zone-based environment. That is what keeps
the deliberate `provideZoneChangeDetection()` in `main.ts` consistent with the tests — do not drop
`zone.js` from `polyfills` without also making the app zoneless.

`globals: true` is set by the builder, so `describe`/`it`/`expect`/`vi` need no import;
`tsconfig.spec.json` pulls the matching types via `"types": ["vitest/globals"]`.

The `test` target pins `"watch": false`, so `ng test` always runs once and exits; the builder would
otherwise default to watch mode in a TTY. Opt back in per run with `ng test --watch`. Filtering:
`ng test --include "**/song.store.spec.ts"` by file, `ng test --filter "^SongStore"` by test name.
Coverage is **off** by default with no thresholds; `ng test --coverage` (provider
`@vitest/coverage-v8`) writes to `coverage/`.

## Architecture — standalone Angular, NgRx SignalStore

State lives in `src/app/store/song.store.ts` — a single `signalStore({ providedIn: 'root' })`.
Two conventions worth preserving:

- Initial state is injected through a `SONG_STATE` `InjectionToken` with a factory default (now
  empty — the catalogue comes from the backend). This is the test seam: specs provide
  `{ provide: SONG_STATE, useValue: {...} satisfies SongState }`. `song.store.spec.ts` is the
  model to copy.
- Store methods are synchronous `patchState` operations — there is no `rxMethod` and no
  `withEntities`. **HTTP lives in `SongService`, not in the store**; the service calls the API and
  then patches, which is what keeps the store trivially testable. `SongState` carries `loading`
  and `error` alongside `allSongs`.

Mocking convention is `ng-mocks` (`MockProvider`). `MockProvider` stubs are *not* vitest spies, so
pass your own: `vi.fn<(id: string) => void>()` — the bare `vi.fn()` return type is too loose for
`Partial<T>` under `strict` and fails with TS2769.

## Conventions

- **TypeScript is strict** (see `tsconfig.json`, including `strictTemplates` and
  `strictInjectionParameters`). Do not loosen these.
- **DI uses the `inject()` function**, never constructor injection.
- **Templates use `@if` / `@for`**, not `*ngIf` / `*ngFor`, and read store signals directly rather
  than going through `AsyncPipe`.
- **Styling is Tailwind 3 + daisyUI utility classes in templates only.** Every component `.scss`
  file is intentionally 0 bytes; `styles.scss` holds nothing but the three `@tailwind` directives.
  The daisyUI theme is hardcoded to `dim` in `index.html` and there is no theme switcher.
- **Biome** replaces ESLint and Prettier entirely (no `.eslintrc`, no `.prettierrc`). Run
  `pnpm run biome:check` before committing frontend changes.
