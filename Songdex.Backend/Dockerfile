# https://hub.docker.com/_/microsoft-dotnet
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /build

COPY . .
RUN dotnet publish Songdex.Backend.Main/Songdex.Backend.Main.csproj -c Release -o published

# final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /build/published ./
ENTRYPOINT ["dotnet", "Songdex.Backend.Main.dll"]
