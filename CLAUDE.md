# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Songdex is a single-user, locally hosted catalogue for cover songs. See `docs/requirements.md` for
vision, scope boundaries and the target domain model, and `docs/backlog.md` for the prioritised
story backlog and the technical track.
**Those two documents are the source of truth for what should be built**.
`docs/architecture.md` is the source of truth for **how the backend is structured**; it is binding
and enforced by tests.

Frontend-specific guidance lives in `Songdex.Frontend/CLAUDE.md`, backend-specific guidance in
`Songdex.Backend/CLAUDE.md`; each loads when you work on files in that directory.

## Read this before planning any change

The scaffolding is modern and clean, but the **application is an early prototype**. The
frontend↔backend round trip works end to end since 2026-10-28; most features do not exist yet.
Verify before assuming:

- **The web adapter has its own contract.** `Endpoints/Songs/SongContracts.cs` maps `Song` ↔
  `SongResponse`/`SongRequest`. Never serialise the domain object directly — `SongId` would go out
  as `{"value":"…"}`.
- **`Song` carries nine fields** (`id`, `title`, `artist`, `releaseYear: int?`, `referenceLink`,
  `notes`, `genre`, `language`, `album`) and is consistent across frontend, domain, entity and API
  (E1.1 is done). The musical fields (keys, bpm, time signature, duration) and `sourceLink` were
  dropped from the target model on purpose; they live in the backlog's "Parkplatz" only — do not
  add them. What is still missing are the relations `tags[]` (E1.7) and `chordsheets[]` (E3.1).
- **The UI can read and create.** The song form (`songform/`, route `songs/new`, E1.4) calls
  `SongService.createSong`. `updateSong` and `deleteSong` work, but no component calls them yet;
  those forms are E1.5/E1.6.
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

## Full stack (repo root)

Both services carry a `build:` context next to their `image:` tag, so compose builds what is
missing and `--build` forces a rebuild of both in parallel. There are no build scripts; the former
`build-image-*.ps1` / `build-images-and-run.ps1` trio was removed because it duplicated this and
ignored the exit code of each `docker build`, which let a failed backend build start the stack on
a stale image.

The backend Dockerfile restores NuGet packages in a dedicated layer and therefore copies the
`.csproj` files of **Main's transitive graph** (Main, Adapter.In.Web, Adapter.Out.Persistence,
Application, Common) plus `global.json` and the two `Directory.*.props` before the source. A new
project in that graph has to be added to that `COPY` list, otherwise the restore fails. The
subsequent `dotnet publish` runs `--no-restore`.

Compose runs the backend with `ASPNETCORE_ENVIRONMENT=Development` on purpose: that is what
registers `LocalDatabaseInitializer`, so the composed stack migrates and seeds itself. The SQLite
file lives on the named volume `songdex-data` at `/app/data`, not in the container layer — a
`docker compose down` without `-v` keeps your songs.

The frontend image serves the SPA through nginx and **proxies `/api/` to `backend:8080`**, so the
production build uses a relative API base URL (`src/environments/environment.prod.ts`, swapped in
by `fileReplacements`) and the browser never sees :5286. CORS therefore only matters for
`ng serve`; it allows `http://localhost:4200` and `http://localhost:8080`.

## Conventions

- **All comments in source code are English** — `//`, `///`, `/* */`, XML doc comments, `<!-- -->`
  in `.csproj`/`.props`/templates, and `#` in scripts and dotfiles. This holds for both the backend
  and the frontend, including ArchUnitNET `.Because(…)` strings, which read as prose in the test
  output. Identifiers, log messages and exception messages are English too.
- **Commit messages are English**, in the Conventional Commits form the history already uses
  (`feat:`, `chore(backend):`, `refactor(backend):`). The `docs/` directory is the single
  exception to the English rule — those files are German by choice.
