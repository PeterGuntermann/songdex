# Songdex.Backend

Backend-specific guidance; the repo-wide rules are in the root `CLAUDE.md`.

## Build and tooling

If `dotnet ef` aborts with `Failed to resolve hostfxr.dll`, its apphost cannot find the runtime
because the SDK does not live in the default location. Set `DOTNET_ROOT` to the directory holding
`dotnet.exe` (here `C:\Users\<user>\.dotnet`) and it works.

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

## Architecture — hexagonal (ports & adapters)

**`docs/architecture.md` is the binding specification.** Read it before adding a backend project,
a port, an endpoint or a table — it has a "Wohin gehört mein neuer Code?" section with the
concrete recipes. What follows here is only the orientation.

Dependencies point inward only; `Main` is the sole project that knows everything, because it is
the composition root.

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

The domain model and the persistence entity are deliberately separate types, translated by
`Songdex.Backend.Adapter.Out.Persistence/Mappings/SongMappings.cs`. Keep that separation: `Song`
(domain) must not gain EF attributes.

**These rules are tested, not just documented.** `Songdex.Backend.Architecture.Test` checks eight
ArchUnitNET rules on IL level (see `docs/architecture.md` §6). If you change the structure
deliberately, update that test *and* `docs/architecture.md`. When you add a rule, prove it with a
negative probe — a green rule that was never red proves nothing.
