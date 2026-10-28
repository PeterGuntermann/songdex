# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Songdex is a single-user, locally hosted catalogue for cover songs. See `docs/requirements.md` for
vision, scope boundaries and the target domain model, and `docs/backlog.md` for the prioritised
story backlog and the technical track. **Those two documents are the source of truth for what
should be built** — they replaced the former `Todos.frontend.md` / `Todos.backend.md` checklists.
`docs/architecture.md` is the source of truth for **how the backend is structured**; it is binding
and enforced by tests.

Repository layout:

| Path | Role |
|---|---|
| `Songdex.Frontend/` | Angular 22 SPA (the active frontend) |
| `Songdex.Backend/` | .NET 10 Web API, hexagonal (ports & adapters), EF Core + SQLite |
| `docs/` | Requirements, backlog and the backend architecture |
| `archived/` | Dead prototypes (`vanillajs`, `CoversongsAspnetMvc`, `ng13-deployed-to-vercel`) — do not touch |
| `dotnet-cli-generated/` | Untouched scaffolding leftovers |

## Read this before planning any change

The scaffolding is modern and clean, but the **application is a prototype**. Several things that
look implemented are not. Verify before assuming:

- **The frontend is not actually connected to the backend.** `src/app/services/song.service.ts`
  fetches `/api/coversongs` and `console.log`s the result behind a `// TODO: Save to store`. The
  store never receives it, so the UI always renders generated dummy data from `util/dummy-data.ts`.
- **Four of five song CRUD endpoints are empty stubs.** Only `GetAllSongs` works. The stubs in
  `Songdex.Backend.Adapter.In.Web/Endpoints/Songs/` also take `int id`, but `SongId` is an
  8-character **string** — the signatures are simply wrong.
- **Two parallel song APIs exist.** `CoversongsController` (`/api/coversongs`, works) and the
  minimal-API group (`/api/songs`, mostly stubs). One of them is meant to go away.
- **`/api/artists` has five endpoints but no entity behind them.** Per the requirements, `artist`
  stays a free-text field on `Song`; these routes are slated for removal.
- **`Song` is modelled four times, inconsistently.** The frontend has `link`, the backend has
  `releaseYear` — the models cannot round-trip. See `docs/requirements.md` §3 for the agreed target.
- **There are no `src/environments/` files.** The API base URL is hardcoded to
  `http://localhost:5286` in `song.service.ts`, so the Docker image cannot reach the composed
  backend. This blocks the real frontend↔backend wiring.
- **Four of the five `Songdex.Backend.*.Test` projects are empty shells** with zero `.cs` files.
  Only `Songdex.Backend.Architecture.Test` contains tests (the ArchUnitNET rules).
- **`ISongRepository` only has `GetAll()`** — no Add/Update/Delete.
- **Legacy `coversongs` naming persists** in the build output path (`dist/coversongs-frontend`,
  matched by the Dockerfile COPY), `nginx.conf`, the page title and the API path.
- **`/test` is a daisyUI playground route**, not a feature.

## Commands

### Frontend (`Songdex.Frontend/`)

```bash
pnpm install
pnpm start                 # ng serve on http://localhost:4200
pnpm run build             # production build to dist/coversongs-frontend
pnpm test                  # Vitest via @angular/build:unit-test
pnpm run biome:check       # lint + format + organize imports, writes fixes
pnpm run biome:lint        # lint only, writes fixes
pnpm run biome:format      # format only
```

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

There is a JetBrains run configuration at `Songdex.Frontend/.run/All Tests.run.xml`.

### Backend (`Songdex.Backend/`)

```bash
dotnet build Songdex.Backend.slnx
dotnet test  Songdex.Backend.slnx
dotnet run --project Songdex.Backend.Main        # http://localhost:5286
```

`dotnet test --filter FullyQualifiedName~SomeTest` filters a single test.

If `dotnet ef` aborts with `Failed to resolve hostfxr.dll`, its apphost cannot find the runtime
because the SDK does not live in the default location. Set `DOTNET_ROOT` to the directory holding
`dotnet.exe` (here `C:\Users\<user>\.dotnet`) and it works.

`Songdex.Backend.Main` is the composition root and the startup project. Swagger UI is served
in Development only. `global.json` pins SDK 10.0.0 with `rollForward: latestMajor`.

`Directory.Build.props` at `Songdex.Backend/` sets `TargetFramework`, `Nullable` and
`ImplicitUsings` for every project below it — do not repeat them in individual `.csproj` files.

Package versions are managed centrally: `Directory.Packages.props` (same directory) sets
`ManagePackageVersionsCentrally` and holds every `PackageVersion`. A `.csproj` carries the bare
`<PackageReference Include="…" />` without a `Version` attribute — adding one fails the build with
NU1008. After bumping a version there, run `dotnet restore --force-evaluate` so
`Songdex.Backend.Main/packages.lock.json` (the only lock file, from `RestorePackagesWithLockFile`)
picks it up.

EF Core migrations live in `Songdex.Backend.Adapter.Out.Persistence/Migrations/`:

```bash
dotnet ef migrations add <Name> \
  --project Songdex.Backend.Adapter.Out.Persistence \
  --startup-project Songdex.Backend.Main
```

The two oldest `*.Designer.cs` snapshots still name `Songdex.Backend.Domain.Model.Song` in their
`modelBuilder.Entity("…")` strings. That is correct — they record the historical model state and
are strings, not type references. Only the current `SongdexDbContextModelSnapshot.cs` has to match
today's types.

In Development, `LocalDatabaseInitializer` (an `IHostedService`, registered only when
`ASPNETCORE_ENVIRONMENT=Development`) runs `Database.MigrateAsync()` on startup and seeds from
`DataSeed.cs` if the table is empty. You normally do not run `database update` by hand.

### Full stack (repo root)

```bash
pwsh ./build-images-and-run.ps1    # builds both images, then docker compose up -d
docker compose up --detach         # backend :5286, frontend :8080
```

CORS allows `http://localhost:4200` and `http://localhost:8080` only.

## Architecture

### Backend — hexagonal (ports & adapters)

**`docs/architecture.md` is the binding specification.** Read it before adding a backend project,
a port, an endpoint or a table — it has a "Wohin gehört mein neuer Code?" section with the
concrete recipes. What follows here is only the orientation.

```
Main ──────────────┬──────────────┐
                   ↓              ↓
        Adapter.In.Web    Adapter.Out.Persistence
                   └──────┬───────┘
                          ↓
                     Application ──→ Common
```

All `.csproj` sit flat in `Songdex.Backend/`; the tree view in the IDE comes from solution folders
(`src/…`, `test/…`) in `Songdex.Backend.slnx`. Dependencies point inward only; `Main` is the sole
project that knows everything, because it is the composition root.

- `Songdex.Backend.Application` holds `Domain/Model`, `Domain/Service`, `Port/In` (use cases) and
  `Port/Out` (repositories/gateways). It knows no adapter.
- `Songdex.Backend.Adapter.In.Web` may only touch `Port/In`. A controller or endpoint that
  injects a `Port/Out` interface bypasses the application — that is a rule violation, not a
  shortcut.
- `Songdex.Backend.Adapter.Out.Persistence` implements `Port/Out`. `SongdexDbContext` and
  `SongEntity` must not leave it.
- The two adapters do not reference each other.

Each project contributes one `Add*`/`Use*` extension that `Program.cs` composes (`AddApplication`,
`AddPersistenceAdapter`, `AddLocalDatabaseInitializer`, `AddWebAdapter`, `UseWebAdapter`) — follow
that pattern rather than registering services directly in `Program.cs`.

Naming: incoming ports are `I{Verb}{Nomen}UseCase`, one interface per use case; outgoing ports keep
established .NET names (`I…Repository`, `I…Client`); domain services are `{Aggregat}Service` and
bundle all use cases of their aggregate.

Request flow today: `CoversongsController` → `IGetAllSongsUseCase` (Port/In) → `SongService`
(Domain/Service) → `ISongRepository` (Port/Out) → `SongRepository` (Persistence adapter) →
EF Core → SQLite. Note `SongService.GetAllSongs()` does `songRepository.GetAll().Result` — a
blocking sync-over-async call that should be fixed when touched.

The domain model and the persistence entity are deliberately separate types, translated by
`Songdex.Backend.Adapter.Out.Persistence/Mappings/SongMappings.cs`. Keep that separation: `Song`
(domain) must not gain EF attributes.

`Common/Result.cs` exists but is used nowhere yet — adopting it for use cases is a planned task
(T-7 in the backlog), so prefer it for new use cases.

**These rules are tested, not just documented.** `Songdex.Backend.Architecture.Test` checks eight
ArchUnitNET rules on IL level (see `docs/architecture.md` §6). If you change the structure
deliberately, update that test *and* `docs/architecture.md`. When you add a rule, prove it with a
negative probe — a green rule that was never red proves nothing.

### Frontend — standalone Angular, NgRx SignalStore

No `NgModule` anywhere. `main.ts` uses `bootstrapApplication`; `app.config.ts` provides only
`provideRouter` and `provideHttpClient` (no interceptors, guards or resolvers).
`provideZoneChangeDetection()` is kept deliberately — the app is **not** zoneless.

All routes in `app.routes.ts` are lazy via `loadComponent()`. `AppComponent` is currently just a
bare `<router-outlet/>` with no shell or navigation.

State lives in `src/app/store/song.store.ts` — a single `signalStore({ providedIn: 'root' })`.
Two conventions worth preserving:

- Initial state is injected through a `SONG_STATE` `InjectionToken` with a factory default. This is
  the test seam: specs provide `{ provide: SONG_STATE, useValue: {...} satisfies SongState }`.
  `song.store.spec.ts` is the one genuinely tested unit in the frontend and the model to copy.
- Store methods are synchronous `patchState` operations. There is no `rxMethod`, no `withEntities`,
  no loading/error state yet.

Mocking convention is `ng-mocks` (`MockProvider`). Four of six spec files are still unmodified CLI
"should create" smoke tests.

## Conventions

- **All comments in source code are English** — `//`, `///`, `/* */`, XML doc comments, `<!-- -->`
  in `.csproj`/`.props`/templates, and `#` in scripts and dotfiles. This holds for both the backend
  and the frontend, including ArchUnitNET `.Because(…)` strings, which read as prose in the test
  output. Identifiers, log messages and exception messages are English too. The `docs/` directory
  and commit messages are exempt — those are German by choice.
- **Biome** replaces ESLint and Prettier entirely (no `.eslintrc`, no `.prettierrc`): single quotes,
  2-space indent, 100-column lines, import organisation on. Run `npm run biome:check` before
  committing frontend changes.
- **TypeScript is strict** — `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`,
  `noImplicitReturns`, plus `strictTemplates` and `strictInjectionParameters`. Do not loosen these.
- **DI uses the `inject()` function**, never constructor injection.
- **Templates use `@if` / `@for`**, not `*ngIf` / `*ngFor`, and read store signals directly rather
  than going through `AsyncPipe`.
- **Styling is Tailwind 3 + daisyUI utility classes in templates only.** Every component `.scss`
  file is intentionally 0 bytes; `styles.scss` holds nothing but the three `@tailwind` directives.
  The daisyUI theme is hardcoded to `dim` in `index.html` and there is no theme switcher.
- Components still use the four-file layout (`.ts` / `.html` / `.scss` / `.spec.ts`).
- Source is organised by type (`models/`, `services/`, `store/`, `util/`) plus one folder per
  feature component. No `core/` / `shared/` / `features/` split, no barrel files.

## Not present

No CI (`.github/` does not exist), no E2E (no Playwright or Cypress), no auth, no i18n
(`@angular/localize` is not installed despite the scaffolded `extract-i18n` target), no PWA or
service worker, no SSR, no Husky hooks, no `.cursorrules` or Copilot instructions.
