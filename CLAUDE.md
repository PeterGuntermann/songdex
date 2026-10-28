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

The scaffolding is modern and clean, but the **application is an early prototype**. The
frontend↔backend round trip works end to end since 2026-10-28; most features do not exist yet.
Verify before assuming:

- **`/api/songs` is the only API.** All five CRUD endpoints are real minimal endpoints and take a
  **string** id. `CoversongsController`, `/api/coversongs` and `/api/artists` are gone.
- **The web adapter has its own contract.** `Endpoints/Songs/SongContracts.cs` maps `Song` ↔
  `SongResponse`/`SongRequest`. Never serialise the domain object directly — `SongId` would go out
  as `{"value":"…"}`.
- **`Song` carries five fields only** (`id`, `title`, `artist`, `releaseYear: int?`,
  `referenceLink`) and is consistent across frontend, domain, entity and API. The rest of the
  target model in `docs/requirements.md` §3 — the musical fields, `sourceLink`, `notes`, `genre`,
  `language`, `album` — is still open (E1.1).
- **The UI can only read.** `SongService` has `createSong`/`updateSong`/`deleteSong` and they work,
  but no component calls them; the forms are E1.4–E1.6.
- **Three of the five `Songdex.Backend.*.Test` projects are empty shells** with zero `.cs` files.
  Only `Architecture.Test` (ArchUnitNET rules) and `Application.Test` (`SongServiceTest`) are filled.
  There is no test that exercises an endpoint or the database (T-8).
- **`Common/Result.cs` is still used nowhere.** The CRUD use cases return `Song?`/`bool` instead,
  because `Result<T>.IsSuccess() => Value is not null` cannot express a successful `Delete`.
  Fixing `Result<T>` first is T-7 — do not adopt it as-is.
- **Legacy `coversongs` naming persists** in the build output path (`dist/coversongs-frontend`,
  matched by the Dockerfile COPY), the nginx site file name, the page title and the image names.
- **`/test` is a daisyUI playground route**, not a feature.
- **`biome check` reports 15 pre-existing findings** — the playground template, the three
  `@tailwind` directives in `styles.scss` and the `routerLink` anchor in `songdetails`. Do not add
  a sixteenth; Biome does not understand Angular bindings, so prefer `href="{{ … }}"` over
  `[href]` in templates.

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
docker compose down -v             # -v also drops the songdex-data volume
```

Compose runs the backend with `ASPNETCORE_ENVIRONMENT=Development` on purpose: that is what
registers `LocalDatabaseInitializer`, so the composed stack migrates and seeds itself. The SQLite
file lives on the named volume `songdex-data` at `/app/data`, not in the container layer — a
`docker compose down` without `-v` keeps your songs.

The frontend image serves the SPA through nginx and **proxies `/api/` to `backend:8080`**, so the
production build uses a relative API base URL (`src/environments/environment.prod.ts`, swapped in
by `fileReplacements`) and the browser never sees :5286. CORS therefore only matters for
`ng serve`; it allows `http://localhost:4200` and `http://localhost:8080`.

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
`Partial<T>` under `strict` and fails with TS2769. Two of six spec files
(`app.component.spec.ts`, `songlist.component.spec.ts`) are still unmodified CLI smoke tests.

## Conventions

- **All comments in source code are English** — `//`, `///`, `/* */`, XML doc comments, `<!-- -->`
  in `.csproj`/`.props`/templates, and `#` in scripts and dotfiles. This holds for both the backend
  and the frontend, including ArchUnitNET `.Because(…)` strings, which read as prose in the test
  output. Identifiers, log messages and exception messages are English too.
- **Commit messages are English**, in the Conventional Commits form the history already uses
  (`feat:`, `chore(backend):`, `refactor(backend):`). The `docs/` directory is the single
  exception to the English rule — those files are German by choice.
- **Biome** replaces ESLint and Prettier entirely (no `.eslintrc`, no `.prettierrc`): single quotes,
  2-space indent, 100-column lines, import organisation on. Run `pnpm run biome:check` before
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
- Source is organised by type (`models/`, `services/`, `store/`, `environments/`) plus one folder
  per feature component. No `core/` / `shared/` / `features/` split, no barrel files.

## Not present

No CI (`.github/` does not exist), no E2E (no Playwright or Cypress), no auth, no i18n
(`@angular/localize` is not installed despite the scaffolded `extract-i18n` target), no PWA or
service worker, no SSR, no Husky hooks, no `.cursorrules` or Copilot instructions.
