# Songdex Backend — Architektur

> Stand: 2026-10-28 · Begleitdokumente: [requirements.md](./requirements.md), [backlog.md](./backlog.md)
>
> **Dieses Dokument ist verbindlich.** Die Regeln aus §2 und §3 werden von
> `Songdex.Backend.Architecture.Test` automatisch geprüft — wer sie brechen will, ändert zuerst
> dieses Dokument und dann die Tests, nicht umgekehrt.

Das Frontend ist hiervon nicht betroffen; für dessen Konventionen siehe `CLAUDE.md`.

## 1. Warum hexagonal

Songdex ist ein Lernprojekt mit einem Nutzer. Die Architektur ist nicht gewählt, weil die Fachlogik
komplex wäre, sondern weil sie eine Frage beantwortet, die sich bei jeder Erweiterung neu stellt:
**wohin gehört der Code, den ich gerade schreibe?** Schichtnamen wie `Infrastructure` beantworten
das nicht — `Ports & Adapters` schon, weil jeder Baustein seine *Rolle* im Namen trägt.

Die tragende Idee: Die Fachlichkeit steht in der Mitte und kennt die Außenwelt nicht. Alles, was
von außen hereinkommt (HTTP) oder nach außen geht (SQLite), hängt an einem **Port** — einem
Interface, das die Application besitzt — und wird von einem **Adapter** bedient, den die
Application nicht kennt. Dadurch lässt sich die Datenbank oder die API austauschen, ohne die
Fachlogik anzufassen, und die Fachlogik lässt sich ohne beides testen.

## 2. Ringe und Abhängigkeitsrichtung

```
Main ──────────────┬──────────────┐
                   ↓              ↓
        Adapter.In.Web    Adapter.Out.Persistence
                   └──────┬───────┘
                          ↓
                     Application ──→ Common
```

**Abhängigkeiten zeigen ausschließlich nach innen.** Die einzige Ausnahme ist `Main`: als
Kompositionswurzel kennt es alles, damit sonst niemand etwas kennen muss.

| Projekt                                   | Rolle                                                                   | darf referenzieren |
|-------------------------------------------|-------------------------------------------------------------------------|--------------------|
| `Songdex.Backend.Common`                  | technische Hilfsmittel ohne Fachbezug (`Result<T>`)                     | —                  |
| `Songdex.Backend.Application`             | Domänenmodell, Domain-Services, alle Ports                              | `Common`           |
| `Songdex.Backend.Adapter.In.Web`          | eingehender Adapter: HTTP, Minimal-Endpoints, API-Verträge, CORS, OpenAPI | `Application`    |
| `Songdex.Backend.Adapter.Out.Persistence` | ausgehender Adapter: EF Core, SQLite, Migrationen, Seeding              | `Application`      |
| `Songdex.Backend.Main`                    | Kompositionswurzel: `Program.cs`, `appsettings`, Hosting                | alle               |

Die beiden Adapter kennen **einander nicht**. Nur `Main` kennt beide und verdrahtet sie.

### Ein- und ausgehende Ports

| Port-Art                                             | Wer besitzt ihn | Wer implementiert ihn | Wer ruft ihn auf    |
|------------------------------------------------------|-----------------|-----------------------|---------------------|
| `Application.Port.In` (Use Case)                     | Application     | Domain-Service        | eingehender Adapter |
| `Application.Port.Out` (Repository, Gateway, Client) | Application     | ausgehender Adapter   | Domain-Service      |

Daraus folgt die Regel, die am leichtesten verletzt wird: **ein eingehender Adapter darf
`Port.Out` nicht anfassen.** Ein Controller, der sich ein `ISongRepository` injizieren lässt,
umgeht die gesamte Fachlogik. Genau das war vor dem Umbau in `Endpoints/Songs/*` der Fall.

## 3. Projektstruktur

Im Dateisystem liegen alle `.csproj` flach nebeneinander; die Baumansicht in Rider/Visual Studio
entsteht über **Solution-Folder** in `Songdex.Backend.slnx`. Das vermeidet
`..\..\..\`-Projektreferenzen und dreifach wiederholte Pfadsegmente.

Die Solution liegt im XML-Format `.slnx` (SDK ≥ 9.0.200, Rider ≥ 2025.1, Visual Studio ≥ 17.14).
Ordner und Projekte stehen dort unter ihrem Klarnamen statt hinter GUIDs, Build-Konfigurationen
sind implizit — ein Umhängen in der Baumansicht ist damit eine Zeile und kein GUID-Abgleich über
drei Abschnitte.

```
Songdex.Backend/
├── Directory.Build.props          TargetFramework, Nullable, ImplicitUsings — zentral für alle
├── Directory.Packages.props       Central Package Management: alle Paketversionen — zentral für alle
├── Songdex.Backend.slnx           Solution-Folder src/ und test/
├── Dockerfile, .dockerignore
├── Songdex.Backend.Common/
│   └── Result.cs
├── Songdex.Backend.Application/
│   ├── Domain/
│   │   ├── Model/      Song.cs, SongId.cs
│   │   └── Service/    SongService.cs
│   ├── Port/
│   │   ├── In/         IGetAllSongsUseCase.cs, IGetSongUseCase.cs, ICreateSongUseCase.cs,
│   │   │               IUpdateSongUseCase.cs, IDeleteSongUseCase.cs
│   │   └── Out/        ISongRepository.cs
│   └── ApplicationExtensions.cs
├── Songdex.Backend.Adapter.In.Web/
│   ├── Endpoints/
│   │   └── Songs/      GetAllSongs.cs, GetSong.cs, CreateSong.cs, UpdateSong.cs,
│   │                   DeleteSong.cs, SongContracts.cs, SongRequestValidation.cs
│   └── WebAdapterExtensions.cs
├── Songdex.Backend.Adapter.Out.Persistence/
│   ├── Entities/       SongEntity.cs
│   ├── Mappings/       SongMappings.cs
│   ├── Migrations/
│   ├── Seeding/        DataSeed.cs, LocalDatabaseInitializer.cs
│   ├── SongdexDbContext.cs
│   ├── SongRepository.cs
│   └── PersistenceAdapterExtensions.cs
├── Songdex.Backend.Main/
│   ├── Program.cs, appsettings*.json, Properties/
│   └── packages.lock.json
└── *.Test/             je ein Testprojekt pro Produktivprojekt
    └── Songdex.Backend.Architecture.Test/   HexagonalArchitectureTest.cs
```

Die Ordner innerhalb eines Projekts sind die Namespaces; der Root-Namespace ist der Projektname.
Ein Zwischenverzeichnis `Database/` gibt es im Persistenzadapter bewusst nicht mehr — das Projekt
*ist* der Datenbankadapter.

### Verdrahtung

Jedes Projekt steuert genau eine `Add*`/`Use*`-Extension bei, `Program.cs` setzt sie zusammen.
Registriere nie einen Service direkt in `Program.cs`.

| Projekt                 | Extension                                                               |
|-------------------------|-------------------------------------------------------------------------|
| Application             | `AddApplication()`                                                      |
| Adapter.Out.Persistence | `AddPersistenceAdapter(configuration)`, `AddLocalDatabaseInitializer()` |
| Adapter.In.Web          | `AddWebAdapter()`, `UseWebAdapter()`                                    |

## 4. Namenskonventionen

| Baustein          | Konvention                                                                  | Beispiel               |
|-------------------|-----------------------------------------------------------------------------|------------------------|
| Eingehender Port  | `I{Verb}{Nomen}UseCase` — ein Interface **pro Use Case**                    | `IGetAllSongsUseCase`  |
| Ausgehender Port  | etablierter .NET-Begriff: `I…Repository`, `I…Client`, `I…Gateway`           | `ISongRepository`      |
| Domain-Service    | `{Aggregat}Service`, implementiert die Use-Case-Interfaces seines Aggregats | `SongService`          |
| Persistenzentität | `{Aggregat}Entity`, verlässt den Persistenzadapter nie                      | `SongEntity`           |
| Adapter-Extension | `{Adaptername}Extensions` mit `Add{Adaptername}`                            | `WebAdapterExtensions` |

**Ports werden pro Use Case geschnitten, Implementierungen pro Aggregat gebündelt.** Ein Aufrufer
soll nur von dem abhängen, was er benutzt; fünf Klassen mit je einer Methode wären dagegen Ballast.
`SongService` implementiert seit E1.2 alle fünf CRUD-Use-Cases. Damit daraus nicht fünf Instanzen
pro Request werden, registriert `ApplicationExtensions` die Klasse einmal und leitet die fünf
Interfaces per Factory auf dieselbe Registrierung weiter.

Hombergs' `ILoadSongsPort`-Schema wird bewusst **nicht** übernommen: Das ist Java-Jargon, und der
Namespace `Port.Out` benennt die Rolle bereits.

**Quellcode ist durchgehend englisch** — Bezeichner, Kommentare, Log- und Exception-Meldungen, auch
die `.Because(…)`-Texte der Architekturtests. Diese Dokumentation ist die bewusste Ausnahme.

## 5. Wohin gehört mein neuer Code?

### Ich baue einen neuen HTTP-Endpunkt

1. Use-Case-Interface in `Application/Port/In/` anlegen (`I{Verb}{Nomen}UseCase`).
2. Methode im passenden `{Aggregat}Service` in `Application/Domain/Service/` implementieren.
3. In `ApplicationExtensions` registrieren.
4. Endpunkt in `Adapter.In.Web/Endpoints/` schreiben und das **Use-Case-Interface** injizieren.
5. Route in `WebAdapterExtensions.UseWebAdapter()` eintragen.

Request und Response sind dabei eigene `record`-Typen des Web-Adapters (`Endpoints/Songs/
SongContracts.cs`), nie das Domänenobjekt: `SongId` ist fachlich ein Wertobjekt, über die Leitung
aber ein flacher String. Der API-Vertrag soll sich nicht ändern, nur weil das Modell es tut.

Kein Schritt davon fasst den Persistenzadapter an.

### Ich brauche eine neue Tabelle oder Spalte

1. `{Aggregat}Entity` in `Adapter.Out.Persistence/Entities/` anlegen oder ändern.
2. Mapping in `Adapter.Out.Persistence/Mappings/` nachziehen — das Domänenmodell und die Entität
   bleiben getrennte Typen.
3. `SongdexDbContext` erweitern.
4. Migration erzeugen (siehe `CLAUDE.md`).

Das Domänenmodell ändert sich dadurch nur, wenn sich die *Fachlichkeit* ändert — nicht, weil die
Datenbank eine Spalte mehr hat.

### Ich brauche Daten von außen (Datei-Import, externe API, Dateisystem)

1. Ausgehenden Port in `Application/Port/Out/` definieren — in fachlichen Begriffen, ohne HTTP-,
   Datei- oder SQL-Vokabular.
2. Neues Adapterprojekt `Songdex.Backend.Adapter.Out.{Name}` anlegen, flach neben den anderen,
   in den Solution-Folder `src/Adapter/Out` einhängen; das zugehörige Testprojekt direkt
   unter `test`.
3. Port dort implementieren, `Add{Name}Adapter()`-Extension beisteuern, in `Program.cs` aufrufen.
4. `Directory.Build.props` liefert `TargetFramework` und `Nullable`, `Directory.Packages.props`
   die Paketversionen — beides nicht im neuen `.csproj` wiederholen.

### Ich brauche ein neues NuGet-Paket

Paketversionen werden zentral verwaltet (`ManagePackageVersionsCentrally`), die `.csproj` nennen
nur noch den Paketnamen:

1. `<PackageVersion Include="…" Version="…" />` in `Directory.Packages.props` eintragen — in die
   Gruppe *Runtime* oder *Test*, alphabetisch.
2. `<PackageReference Include="…" />` **ohne** `Version` in das `.csproj` setzen, das es braucht.
3. Beim Anheben einer Version genügt die Änderung in `Directory.Packages.props`; danach
   `dotnet restore --force-evaluate`, damit `Songdex.Backend.Main/packages.lock.json` nachzieht.

Ein `Version`-Attribut am `PackageReference` bricht den Build (NU1008). Eine bewusste Abweichung
für ein einzelnes Projekt liefe über `VersionOverride` — bisher braucht das keines.

### Ich will Fachlogik testen

In `Songdex.Backend.Application.Test`, gegen die Ports. Ausgehende Ports werden gemockt; es braucht
weder Datenbank noch Webserver.

### Es passt nirgendwo hin

Dann ist entweder der Schnitt falsch oder die Anforderung unklar. Erst dieses Dokument klären,
dann Code schreiben — nicht einen Adapter als Abkürzung missbrauchen.

## 6. Architekturtests

`Songdex.Backend.Architecture.Test` prüft die Regeln mit
[ArchUnitNET](https://github.com/TNG/ArchUnitNET) auf IL-Ebene. Das Projekt referenziert bewusst
alle fünf Produktivprojekte und ist selbst kein Teil des Produktiv-Abhängigkeitsgraphen.

| # | Regel                                                                                                                                              | Test                                       |
|---|----------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| 1 | `Application.*` hängt von keinem `Adapter.*` ab                                                                                                    | `ApplicationDependsOnNoAdapter`            |
| 2 | `Application.Domain.*` hängt nicht von `Microsoft.EntityFrameworkCore.*`, `Microsoft.AspNetCore.*` oder `System.ComponentModel.DataAnnotations` ab | `DomainIsFreeOfInfrastructureTechnology`   |
| 3 | `Adapter.In.*` und `Adapter.Out.*` hängen nicht voneinander ab                                                                                     | `AdaptersDoNotKnowEachOther`               |
| 4 | `Adapter.In.*` hängt nicht von `Application.Port.Out` ab                                                                                           | `IncomingAdaptersUseOnlyIncomingPorts`     |
| 5 | `Application.Port.*` enthält ausschließlich Interfaces                                                                                             | `PortsContainOnlyInterfaces`               |
| 6 | Jede Klasse in `Application.Domain.Service` implementiert mindestens ein `Port.In`-Interface                                                       | `DomainServicesImplementAnIncomingPort`    |
| 7 | `SongdexDbContext` und `SongEntity` werden nur innerhalb von `Adapter.Out.Persistence` verwendet                                                   | `PersistenceDetailsStayInsideTheirAdapter` |
| + | `Common` hängt von nichts im Projekt ab                                                                                                            | `CommonDependsOnNothingInsideTheProject`   |

**Regel 2 ist der eigentliche Zugewinn gegenüber den Projektreferenzen.** EF Core ist in
`Application` mangels `PackageReference` ohnehin unerreichbar, aber `[MaxLength]` und `[Key]` aus
`System.ComponentModel.DataAnnotations` liegen in der BCL und wären im Domänenmodell sonst
jederzeit möglich.

Alle acht Regeln wurden mit einer Negativprobe belegt: Jede wurde durch eine absichtlich
eingebaute Verletzung rot gemacht und danach zurückgenommen. Wer eine Regel ergänzt, sollte das
genauso halten — eine grüne Regel, die nie rot war, beweist nichts.

Bekannte Grenze: ArchUnitNET erkennt `typeof(X)` in einem verworfenen Ausdruck innerhalb der
Top-Level-Statements von `Program.cs` nicht als Abhängigkeit. Echte Typverwendung (Felder,
Properties, Parameter, Rückgabetypen, Aufrufe) wird erkannt.

## 7. Bekannte Abweichungen

Diese Punkte widersprechen dem Zielbild und sind bewusst noch nicht behoben. Sie gehören zu
benannten Backlog-Einträgen und dürfen nicht als Vorbild für neuen Code dienen.

| Abweichung                                                                                                                                                                       | Gehört zu |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| `Common/Result.cs` ist vorhanden, aber von keinem Use Case benutzt. Die CRUD-Use-Cases geben stattdessen `Song?` bzw. `bool` zurück, weil `Result<T>.IsSuccess() => Value is not null` einen erfolgreichen void-Vorgang (Delete) nicht ausdrücken kann. | T-7       |
| Drei der fachlichen Testprojekte sind leere Hüllen. Nur `Architecture.Test` und `Application.Test` enthalten Tests.                                                              | T-6, T-8  |
