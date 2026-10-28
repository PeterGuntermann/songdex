# https://hub.docker.com/_/microsoft-dotnet
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /build

# Restore in its own layer so that a source change does not invalidate the NuGet
# download. Only Main's transitive graph is listed; a new ProjectReference that is
# missing here makes the restore below fail loudly rather than silently skip a package.
COPY global.json Directory.Build.props Directory.Packages.props ./
COPY Songdex.Backend.Common/Songdex.Backend.Common.csproj Songdex.Backend.Common/
COPY Songdex.Backend.Application/Songdex.Backend.Application.csproj Songdex.Backend.Application/
COPY Songdex.Backend.Adapter.In.Web/Songdex.Backend.Adapter.In.Web.csproj Songdex.Backend.Adapter.In.Web/
COPY Songdex.Backend.Adapter.Out.Persistence/Songdex.Backend.Adapter.Out.Persistence.csproj Songdex.Backend.Adapter.Out.Persistence/
COPY Songdex.Backend.Main/Songdex.Backend.Main.csproj Songdex.Backend.Main/packages.lock.json Songdex.Backend.Main/
RUN dotnet restore Songdex.Backend.Main/Songdex.Backend.Main.csproj

COPY . .
RUN dotnet publish Songdex.Backend.Main/Songdex.Backend.Main.csproj -c Release -o published --no-restore

# final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /build/published ./
ENTRYPOINT ["dotnet", "Songdex.Backend.Main.dll"]
