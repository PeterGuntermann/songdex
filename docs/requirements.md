# Songdex — Requirements

> Stand: 2026-10-28 · Begleitdokument: [backlog.md](./backlog.md)

## 1. Vision & Abgrenzung

**Songdex ist mein persönlicher Katalog für Cover-Songs: Ich finde darin Songs wieder, pflege zu jedem ein ChordPro-Sheet und drucke es mir aus.**

Songdex ist ein Werkzeug für genau einen Nutzer, das lokal auf dem eigenen Rechner läuft. Es ersetzt den Ordner voller PDFs, Screenshots und Ultimate-Guitar-Links durch eine durchsuchbare Sammlung mit einheitlich gesetzten Songsheets.

### Nicht-Ziele

Diese Punkte sind bewusst ausgeschlossen. Sie dürfen nicht stillschweigend über einzelne Stories wieder hereinwachsen — wer sie will, ändert zuerst dieses Dokument.

| Nicht-Ziel                            | Begründung                                                                                      |
|---------------------------------------|-------------------------------------------------------------------------------------------------|
| Mehrbenutzerbetrieb, Accounts, Rechte | Single-User-Tool. Spart Auth, Mandantentrennung und den ganzen Rattenschwanz.                   |
| Öffentliches Hosting                  | Läuft via Docker Compose auf localhost. Kein Betrieb, kein TLS, kein Monitoring.                |
| Mobile- und Offline-Nutzung           | Desktop-Browser genügt. Kein PWA, kein Service Worker, keine lokale Persistenz.                 |
| Notenschrift / Leadsheets             | ChordPro ist Text + Akkorde. Notensatz (VexFlow, MusicXML) ist um Größenordnungen aufwendiger.  |
| Externe Metadaten-APIs                | Keine Anbindung an Spotify, MusicBrainz, Deezer. Daten kommen manuell oder per Datei-Import.    |
| Lyrics-Scraping                       | Liedtexte tippe oder importiere ich selbst.                                                     |
| Artist als eigene Entität             | `artist` bleibt ein Freitextfeld am Song. Die vorhandenen `/api/artists`-Stubs werden entfernt. |
| Fortschritts-/Übe-Tracking            | Kein Lernstatus, keine Übe-Statistik. Freie Tags decken das ab, wo nötig.                       |

## 2. Nutzungskontext

Ein Nutzer, ein Rechner, ein Browser. Start über `docker compose up`, Zugriff auf `http://localhost:8080`.

### Kernszenarien

**S1 — Song finden.** Ich suche einen Song, den ich vor Monaten eingetragen habe, oder ich stöbere nach etwas Passendem für einen bestimmten Anlass. Ich tippe einen Titelfetzen ins Suchfeld oder filtere nach Tags und Tonart. Wenn mir nichts einfällt, lasse ich mir einen Zufallsvorschlag geben.

**S2 — Sheet erstellen und drucken.** Ich lege einen Song an, schreibe oder importiere das ChordPro-Sheet im Split-View-Editor, prüfe rechts die Vorschau, transponiere auf meine Tonart und exportiere ein PDF zum Ausdrucken.

**S3 — Setlist planen.** *(später — siehe §6)* Ich stelle aus dem Katalog eine geordnete Songfolge für einen Auftritt zusammen.

## 3. Domänenmodell (Zielbild)

### Ausgangslage

Seit 2026-10-28 ist `Song` über alle vier Schichten **konsistent modelliert** und kann
round-trippen — Frontend (`models/song.ts`), Domäne (`Application/Domain/Model/Song.cs`), Entität
(`Adapter.Out.Persistence/Entities/SongEntity.cs`) und API-Vertrag
(`Adapter.In.Web/Endpoints/Songs/SongContracts.cs`) tragen dieselben Felder. Damit ist der
schlanke Teil von E1.1 erledigt: `releaseYear` ist eine Zahl, `link` heißt `referenceLink`, die
Routen nehmen die 8-stellige String-Id.

Vollständig ist das Zielmodell damit aber nicht. Gebaut sind **fünf von vierzehn** Song-Feldern,
und beide Relationen fehlen ganz:

| Gruppe      | Vorhanden                              | Offen                                                                     |
|-------------|----------------------------------------|---------------------------------------------------------------------------|
| Identität   | `id`, `title`, `artist`                | —                                                                         |
| Musikalisch | —                                      | `originalKey`, `preferredKey`, `bpm`, `timeSignature`, `durationSeconds`  |
| Verweise    | `referenceLink`                        | `sourceLink`, `notes`                                                     |
| Katalog     | `releaseYear` (`int?`)                 | `genre`, `language`, `album`                                              |
| Relationen  | —                                      | `tags[]`, `chordsheets[]`                                                 |

Die fehlenden **Song-Felder** sind der Rest von E1.1; jedes berührt Frontend-Modell, Domäne,
Entität, `SongContracts.cs`, `SongMappings.cs`, `DataSeed.cs` und eine EF-Migration. `Tag`
(→ E1.7, E1.8) und `Chordsheet` (→ E3.1) existieren als Typen noch nirgends im Code. Die
musikalischen Felder sind Vorbedingung für FR-2.2 (Filter nach Tonart) und FR-3.4
(`preferredKey` als Anzeige-Default).

### Zielmodell

```
Song 1 ──── n Chordsheet
Song n ──── m Tag
```

**Song**

| Gruppe      | Felder                                                                         |
|-------------|--------------------------------------------------------------------------------|
| Identität   | `id` (8-stelliger String), `title` (Pflicht), `artist`                         |
| Musikalisch | `originalKey`, `preferredKey`, `bpm`, `timeSignature`, `durationSeconds`       |
| Verweise    | `referenceLink` (YouTube/Spotify), `sourceLink` (Herkunft des Sheets), `notes` |
| Katalog     | `releaseYear` (**Zahl**, nicht String), `genre`, `language`, `album`           |
| Relationen  | `tags[]`, `chordsheets[]`                                                      |

**Tag** — eigene Entität (`id`, `name`), m:n zu Song. Ersetzt ein festes Statusfeld: Repertoire-Status (`einstudiert`), Anlass (`Sommerfest`) und Kategorie (`Akustik`) sind alle nur Tags.

**Chordsheet** — `id`, `songId`, `variantName` (z. B. „Akustik", „volle Band", „vereinfacht"), `chordProContent`, `createdAt`, `updatedAt`. Mehrere pro Song möglich, keines ist Pflicht.

## 4. Funktionale Anforderungen

Jede FR ist im [Backlog](./backlog.md) durch mindestens eine Story abgedeckt; die Story-IDs stehen jeweils dabei.

### FR-1 Katalog

| ID     | Anforderung                                                                         | Stories    |
|--------|-------------------------------------------------------------------------------------|------------|
| FR-1.1 | Songs werden dauerhaft in der Datenbank gespeichert und überleben einen Neustart.   | E1.1–E1.3  |
| FR-1.2 | Ich kann einen Song anlegen, bearbeiten und löschen. Pflichtfeld ist nur der Titel. | E1.4–E1.6  |
| FR-1.3 | Ich kann einem Song beliebig viele Tags zuweisen und Tags global verwalten.         | E1.7, E1.8 |
| FR-1.4 | Die Anwendung hat eine Navigation zwischen ihren Bereichen.                         | E1.9       |

### FR-2 Entdeckung

| ID     | Anforderung                                                                          | Stories |
|--------|--------------------------------------------------------------------------------------|---------|
| FR-2.1 | Volltextsuche über Titel und Artist, Treffer aktualisieren sich während der Eingabe. | E2.1    |
| FR-2.2 | Kombinierbare Filter nach Tags, Tonart, Genre, Jahrzehnt und Sprache.                | E2.2    |
| FR-2.3 | Sortierung nach jeder angezeigten Spalte, auf- und absteigend.                       | E2.3    |
| FR-2.4 | Spalten ein- und ausblendbar; die Auswahl bleibt über Sitzungen erhalten.            | E2.4    |
| FR-2.5 | Zufallsvorschlag aus dem aktuell gefilterten Bestand.                                | E2.5    |
| FR-2.6 | Die Suche erfasst auch den Liedtext der Chordsheets.                                 | E2.6    |

### FR-3 Chordsheets & Editor

| ID     | Anforderung                                                                                                    | Stories    |
|--------|----------------------------------------------------------------------------------------------------------------|------------|
| FR-3.1 | Ein Song kann mehrere benannte Sheet-Varianten haben.                                                          | E3.1, E3.4 |
| FR-3.2 | ChordPro wird geparst und gerendert: Akkorde stehen über der zugehörigen Textstelle, Sektionen sind abgesetzt. | E3.2       |
| FR-3.3 | Split-View-Editor: links Quelltext mit Syntax-Highlighting, rechts Live-Vorschau.                              | E3.3       |
| FR-3.4 | Die Anzeige nutzt standardmäßig die gespeicherte `preferredKey`.                                               | E3.5       |
| FR-3.5 | Spontanes Transponieren um ± Halbtöne in der Ansicht, ohne das gespeicherte Original zu verändern.             | E3.6       |
| FR-3.6 | Lesemodus ohne Editor, mit vergrößerter Schrift.                                                               | E3.7       |

### FR-4 PDF-Export

| ID     | Anforderung                                                                      | Stories |
|--------|----------------------------------------------------------------------------------|---------|
| FR-4.1 | Ein einzelnes Songsheet lässt sich als druckfertiges PDF exportieren.            | E4.1    |
| FR-4.2 | Der Export übernimmt die gerade angezeigte Tonart.                               | E4.2    |
| FR-4.3 | Pro Export einstellbar: Schriftgröße, ein-/zweispaltig, Akkorde ein-/ausblenden. | E4.3    |

### FR-5 Import, Export & Backup

| ID     | Anforderung                                                                                       | Stories |
|--------|---------------------------------------------------------------------------------------------------|---------|
| FR-5.1 | Songs aus CSV oder JSON importieren, mit Vorschau und Dubletten-Erkennung vor dem Schreiben.      | E5.1    |
| FR-5.2 | ChordPro-Dateien per Mehrfachauswahl importieren; Metadaten aus den Direktiven werden übernommen. | E5.2    |
| FR-5.3 | Gesamten Bestand als JSON exportieren (inkl. Tags und Sheets).                                    | E5.3    |
| FR-5.4 | Einen solchen Export wieder einspielen.                                                           | E5.4    |

### FR-6 Setlists

Siehe §6 — Detailtiefe bewusst offen.

## 5. Nicht-funktionale Anforderungen

| ID    | Anforderung                                                                                                                                                                                                               |
|-------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| NFR-1 | **Umfang:** ausgelegt auf < ~200 Songs. Filtern und Sortieren dürfen clientseitig passieren; keine Server-Paginierung nötig.                                                                                              |
| NFR-2 | **Antwortzeiten:** Suche und Filter reagieren ohne spürbare Verzögerung (< 100 ms bei 200 Songs). Initialer Seitenaufbau < 2 s.                                                                                           |
| NFR-3 | **Datenhaltbarkeit:** Die SQLite-Datei liegt auf einem Docker-Volume, nicht im Container-Layer. Zusätzlich muss ein vollständiger Export jederzeit möglich sein (FR-5.3) — das Volume allein ist kein akzeptables Backup. |
| NFR-4 | **Browser:** aktuelle Chromium-basierte Desktop-Browser. Kein IE, kein Mobile-Layout.                                                                                                                                     |
| NFR-5 | **Bedienbarkeit:** Die Songliste ist vollständig per Tastatur bedienbar. Heute ist die Zeilennavigation ein `(click)` auf `<tr>` ohne Tastatur-Äquivalent — das ist ein Defekt, kein Feature-Wunsch.                      |
| NFR-6 | **Codequalität:** Biome ohne Befunde, TypeScript `strict` und `strictTemplates` bleiben an. Stores und Use-Cases sind unittestet; Coverage wird gemessen statt wie heute abgeschaltet.                                    |
| NFR-7 | **Konfigurierbarkeit:** Die API-Basis-URL ist nicht im Quelltext hartkodiert, sondern pro Umgebung konfigurierbar. Heute verhindert genau das den Betrieb im Compose-Setup.                                               |
| NFR-8 | **Reproduzierbarkeit:** `docker compose up` genügt, um Frontend, Backend und eine migrierte, befüllte Datenbank zu starten.                                                                                               |

## 6. Offene Entscheidungen

| Thema                   | Frage                                                                                                                                                                                                                                        | Betrifft |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| **ChordPro-Parser**     | Fremdbibliothek (z. B. `chordsheetjs`) oder eigener Parser? Die Bibliothek spart viel Arbeit bei Rendering und Transposition; ein eigener Parser hat mehr Lernwert und keine Abhängigkeit.                                                   | E3.2     |
| **PDF-Erzeugung**       | Clientseitig (Browser-Druck mit Print-Stylesheet, oder jsPDF/pdfmake) oder serverseitig (QuestPDF im .NET-Backend)? Browser-Druck ist mit Abstand am billigsten, gibt aber weniger Layoutkontrolle.                                          | E4.1     |
| **Setlist-Detailtiefe** | Braucht eine Setlist Gig-Metadaten (Datum, Ort, Anlass)? Mehrere Sets pro Gig (Set 1 / Pause / Set 2 / Zugaben)? Soll die Gesamtdauer berechnet werden? Setlist-PDF als Booklet mit allen Sheets oder als einseitiger Spickzettel fürs Pult? | E6       |

**Entschieden:** *API-Konsolidierung* (T-3, 2026-10-28) — die Minimal-API-Gruppe `/api/songs`
bleibt, `CoversongsController` und `/api/coversongs` sind gelöscht.
