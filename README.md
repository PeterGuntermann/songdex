# Songdex

An interactive list with popular songs to cover.

## Documentation

- [docs/requirements.md](docs/requirements.md) — vision, scope boundaries, domain model, functional and non-functional requirements
- [docs/backlog.md](docs/backlog.md) — prioritised epics and user stories, plus the technical track
- [docs/architecture.md](docs/architecture.md) — the backend's hexagonal architecture: rings, ports, naming rules and where new code belongs

## Running locally

Prerequisites:

- Docker
- .NET 10 SDK (see `Songdex.Backend/global.json`)
- Node.js with [pnpm](https://pnpm.io).

Run all commands from the repository root unless noted otherwise.

### 1. Demo — frontend and backend as Docker containers

```bash
docker compose up --build
```

- App: <http://localhost:8080> (nginx serves the SPA and proxies `/api/` to the backend)
- Backend and Swagger: <http://localhost:5286/swagger>

The database migrates and seeds itself on startup. The SQLite file lives on the named volume
`songdex-data`, so your songs survive `docker compose down`; use `docker compose down -v` to wipe
them. Drop `--build` to reuse the images built earlier.

### 2. Develop the frontend — backend in Docker, frontend with the Angular CLI

```bash
docker compose up --build backend
```

```bash
cd Songdex.Frontend
pnpm install
pnpm start
```

- App: <http://localhost:4200> (live reload; calls the backend directly on `http://localhost:5286`)
- Before committing: `pnpm run biome:check`

### 3. Develop the backend — backend only, no frontend

```bash
dotnet run --project Songdex.Backend/Songdex.Backend.Main --launch-profile Run
```

- API and Swagger: <http://localhost:5286/swagger>
- The `Run` profile sets `ASPNETCORE_ENVIRONMENT=Development`, so the database `songdex.db` is
  created in the working directory, migrated and seeded on startup.
- Run the tests with `dotnet test Songdex.Backend/Songdex.Backend.slnx`.

The backend container and a local backend both use port 5286 — stop one before starting the other
(`docker compose down`).
