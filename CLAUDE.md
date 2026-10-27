# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Songdex is a single-user, locally hosted catalogue for cover songs. See `docs/requirements.md` for
vision, scope boundaries and the target domain model, and `docs/backlog.md` for the prioritised
story backlog and the technical track. **Those two documents are the source of truth for what
should be built** — they replaced the former `Todos.frontend.md` / `Todos.backend.md` checklists.

Repository layout:

| Path | Role |
|---|---|
| `Songdex.Frontend/` | Angular 21 SPA (the active frontend) |
| `Songdex.Backend/` | .NET 8 Web API, clean-architecture layering, EF Core + SQLite |
| `docs/` | Requirements and backlog |
| `archived/` | Dead prototypes (`vanillajs`, `CoversongsAspnetMvc`, `ng13-deployed-to-vercel`) — do not touch |
| `dotnet-cli-generated/` | Untouched scaffolding leftovers |

## Read this before planning any change

The scaffolding is modern and clean, but the **application is a prototype**. Several things that
look implemented are not. Verify before assuming:

- **The frontend is not actually connected to the backend.** `src/app/services/song.service.ts`
  fetches `/api/coversongs` and `console.log`s the result behind a `// TODO: Save to store`. The
  store never receives it, so the UI always renders generated dummy data from `util/dummy-data.ts`.
- **Four of five song CRUD endpoints are empty stubs.** Only `GetAllSongs` works. The stubs in
  `Songdex.Backend.WebApi/Endpoints/Songs/` also take `int id`, but `SongId` is an 8-character
  **string** — the signatures are simply wrong.
- **Two parallel song APIs exist.** `CoversongsController` (`/api/coversongs`, works) and the
  minimal-API group (`/api/songs`, mostly stubs). One of them is meant to go away.
- **`/api/artists` has five endpoints but no entity behind them.** Per the requirements, `artist`
  stays a free-text field on `Song`; these routes are slated for removal.
- **`Song` is modelled four times, inconsistently.** The frontend has `link`, the backend has
  `releaseYear` — the models cannot round-trip. See `docs/requirements.md` §3 for the agreed target.
- **There are no `src/environments/` files.** The API base URL is hardcoded to
  `http://localhost:5286` in `song.service.ts`, so the Docker image cannot reach the composed
  backend. This blocks the real frontend↔backend wiring.
- **All five `Songdex.Backend.*.Test` projects are empty shells** with zero `.cs` files.
- **`ISongRepository` only has `GetAll()`** — no Add/Update/Delete.
- **Legacy `coversongs` naming persists** in the build output path (`dist/coversongs-frontend`,
  matched by the Dockerfile COPY), `nginx.conf`, the page title and the API path.
- **`/test` is a daisyUI playground route**, not a feature.

## Commands

### Frontend (`Songdex.Frontend/`)

```bash
npm install
npm start                 # ng serve on http://localhost:4200
npm run build             # production build to dist/coversongs-frontend
npm test                  # Jest via @angular-builders/jest
npm run biome:check       # lint + format + organize imports, writes fixes
npm run biome:lint        # lint only, writes fixes
npm run biome:format      # format only
```

Single test: `jest.config.ts` is self-contained (`createCjsPreset()` from `jest-preset-angular`),
so `npx jest song.store` filters by path. Note Jest 30 renamed the flag to `--test-path-patterns`
(plural). Coverage is **off** by default (`collectCoverage: false`) with no thresholds; enable with
`npx jest --coverage` → `dist/coverage/`.

There is a JetBrains run configuration at `Songdex.Frontend/.run/All Tests.run.xml`.

### Backend (`Songdex.Backend/`)

```bash
dotnet build Songdex.Backend.sln
dotnet test  Songdex.Backend.sln
dotnet run --project Songdex.Backend.Service        # http://localhost:5286
```

`dotnet test --filter FullyQualifiedName~SomeTest` filters a single test — but note all test
projects are currently empty.

`Songdex.Backend.Service` is the composition root and the startup project. Swagger UI is served
in Development only. `global.json` pins SDK 8.0.0 with `rollForward: latestMajor`.

EF Core migrations live in `Songdex.Backend.Infrastructure/Database/Migrations/`:

```bash
dotnet ef migrations add <Name> \
  --project Songdex.Backend.Infrastructure \
  --startup-project Songdex.Backend.Service
```

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

### Backend — clean architecture, dependencies point inward

```
Service  →  WebApi  →  Application  →  Domain
                ↘    Infrastructure  ↗
             Common (Result<T>)
```

Each layer exposes a single `Add*`/`Use*` extension method (`AddApplication`, `AddInfrastructure`,
`AddWebApi`, `UseWebApi`) that `Program.cs` composes — follow that pattern when adding a layer
concern rather than registering services directly in `Program.cs`.

Request flow today: `CoversongsController` → `ISongsService` (Domain) → `SongsService`
(Application) → `ISongRepository` (Application abstraction) → `SongRepository` (Infrastructure) →
EF Core → SQLite. Note `SongsService.GetAllSongs()` does `songRepository.GetAll().Result` — a
blocking sync-over-async call that should be fixed when touched.

The domain model and the persistence entity are deliberately separate types, translated by
`Infrastructure/Database/Mappings/SongMappings.cs`. Keep that separation: `Song` (domain) must not
gain EF attributes, `SongEntity` must not leak out of Infrastructure.

`Common/Result.cs` exists but is used nowhere yet — adopting it for use cases is a planned task
(T-7 in the backlog), so prefer it for new use cases.

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
