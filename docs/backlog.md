# Songdex — Backlog

> Stand: 2026-10-27 · Grundlage: [requirements.md](./requirements.md)
>
> Priorisierung in **Now / Next / Later**. Größen: **S** ≈ ein Abend, **M** ≈ ein Wochenende, **L** ≈ mehrere Sessions.
> Der **Tech-Track** wird unabhängig von den Feature-Epics priorisiert.

## Überblick

| Epic | Thema | Priorität |
|---|---|---|
| [E1](#e1--katalog--datenmodell) | Katalog & Datenmodell | **Now** — Meilenstein 1 |
| [E2](#e2--entdeckung) | Entdeckung | **Now** — Meilenstein 1 |
| [E3](#e3--chordsheets--editor) | Chordsheets & Editor | Next |
| [E4](#e4--pdf-export) | PDF-Export | Next |
| [E5](#e5--import-export--backup) | Import, Export & Backup | Next |
| [E6](#e6--setlists) | Setlists | Later — nicht ausspezifiziert |
| [T](#tech-track) | Tech-Track | laufend |

---

## E1 — Katalog & Datenmodell

**Priorität: Now** · Meilenstein 1 zusammen mit E2

> **Warum Enabler-Stories hier drinstehen:** „Katalog ausbauen" ist ohne Durchstich nicht benutzbar. Heute landen Songs nirgends — der einzige HTTP-Call endet in einem `console.log`, die Daten liegen im SignalStore und sind nach einem Reload weg. Ein Katalog mit Tonart, BPM und Tags, den man nicht speichern kann, wäre wertlos. **E1.1–E1.3 sind deshalb Teil dieses Epics, nicht ein Meilenstein davor.**

### E1.1 — Song-Modell vereinheitlichen · M

> Als Nutzer will ich, dass Frontend und Backend dasselbe Song-Modell verwenden, damit meine Eingaben überhaupt gespeichert werden können.

- [ ] `Song` im Frontend (`models/song.ts`) trägt die Felder aus dem Zielmodell in §3 der Requirements
- [ ] `Song.cs` in der Domain und `SongEntity.cs` in der Infrastructure tragen dieselben Felder
- [ ] `releaseYear` ist eine Zahl (`int?`), kein String
- [ ] `link` → aufgeteilt in `referenceLink` und `sourceLink`
- [ ] EF-Migration erzeugt und gegen eine frische DB geprüft
- [ ] `SongMappings.cs` mappt alle Felder in beide Richtungen
- [ ] Bestehende Seed-Daten (`DataSeed.cs`) passen zum neuen Modell

### E1.2 — CRUD-Endpoints ausimplementieren · M

> Als Nutzer will ich, dass das Backend Songs anlegen, ändern und löschen kann, damit die UI mehr als nur lesen kann.

- [ ] `GetSong`, `CreateSong`, `UpdateSong`, `DeleteSong` sind implementiert — heute sind alle vier `// TODO`-Stubs
- [ ] Die Routen nehmen eine **String**-Id entgegen; der heutige `int id` ist schlicht falsch (`SongId` ist ein 8-stelliger String)
- [ ] `ISongRepository` bekommt `Add`, `Update`, `Delete` — heute kennt es nur `GetAll()`
- [ ] Statuscodes: 201 mit `Location` beim Anlegen, 404 bei unbekannter Id, 204 beim Löschen
- [ ] Eingabevalidierung: Titel nicht leer, Längen gemäß Entity
- [ ] Swagger zeigt alle Endpoints mit korrekten Typen

### E1.3 — Songs vom Backend in den Store laden · M

> Als Nutzer will ich meine echten Songs sehen statt generierter Dummy-Daten.

- [ ] Das `// TODO: Save to store` in `services/song.service.ts` ist aufgelöst — die Antwort landet im `SongStore`
- [ ] `SongState` bekommt `loading` und `error`
- [ ] Die Songliste zeigt einen Ladezustand und eine verständliche Fehlermeldung bei nicht erreichbarem Backend
- [ ] `util/dummy-data.ts` und die Dummy-Initialisierung in `song.store.ts` sind entfernt
- [ ] Schreibende Store-Methoden rufen das Backend auf, statt nur lokal zu patchen
- [ ] Der `SONG_STATE`-InjectionToken bleibt als Test-Naht erhalten

**Hängt an:** E1.1, E1.2 · **Blockiert durch:** T-1 (Environments)

### E1.4 — Song anlegen · M

> Als Nutzer will ich einen neuen Song über ein Formular erfassen.

- [ ] Formular mit allen Feldern aus dem Zielmodell, gruppiert nach Identität / Musikalisch / Verweise / Katalog
- [ ] Nur der Titel ist Pflicht
- [ ] Validierung mit Feldfehlern; Speichern ist bei Fehlern blockiert
- [ ] Tonart-Felder als Auswahlliste, nicht als Freitext
- [ ] Nach dem Speichern: Weiterleitung auf die Detailseite des neuen Songs
- [ ] Abbrechen verwirft ohne Nachfrage, wenn nichts eingegeben wurde — mit Nachfrage, wenn doch

### E1.5 — Song bearbeiten · S

> Als Nutzer will ich die Daten eines bestehenden Songs korrigieren.

- [ ] Dasselbe Formular wie E1.4, vorbefüllt
- [ ] Nur geänderte Felder werden übertragen oder es geht ein vollständiges Update raus — die Entscheidung ist dokumentiert
- [ ] Nicht gespeicherte Änderungen lösen beim Verlassen eine Nachfrage aus

### E1.6 — Song löschen · S

> Als Nutzer will ich einen Song aus dem Katalog entfernen.

- [ ] Löschen ist aus Liste und Detailansicht erreichbar
- [ ] Bestätigungsdialog nennt den Titel des Songs
- [ ] Zugehörige Chordsheets werden mitgelöscht (sobald E3.1 steht)
- [ ] Nach dem Löschen: zurück zur Liste

### E1.7 — Tags zuweisen · M

> Als Nutzer will ich Songs mit freien Tags versehen, um sie später wiederzufinden.

- [ ] `Tag`-Entität (`id`, `name`) mit m:n-Beziehung zum Song, inkl. Migration
- [ ] API für Tags: auflisten, anlegen, zuweisen, entfernen
- [ ] Im Song-Formular: Tags hinzufügen mit Autovervollständigung aus bestehenden Tags
- [ ] Ein unbekannter Tag-Name legt den Tag an
- [ ] Tag-Namen sind eindeutig, Vergleich ohne Beachtung von Groß-/Kleinschreibung
- [ ] Tags werden in Liste und Detailansicht als Chips angezeigt

### E1.8 — Tags verwalten · S

> Als Nutzer will ich meine Tag-Liste aufräumen, damit sie nicht vermüllt.

- [ ] Eigene Ansicht mit allen Tags und der Anzahl zugeordneter Songs
- [ ] Umbenennen
- [ ] Löschen (entfernt die Zuordnung bei allen Songs, nach Bestätigung)
- [ ] Zusammenführen zweier Tags
- [ ] Ungenutzte Tags sind erkennbar

### E1.9 — App-Shell mit Navigation · S

> Als Nutzer will ich zwischen den Bereichen der Anwendung wechseln können.

- [ ] `AppComponent` ist nicht länger ein nacktes `<router-outlet/>`
- [ ] Kopfzeile mit Produktnamen und Navigation (Songs, Tags, später Setlists)
- [ ] Der aktive Bereich ist hervorgehoben
- [ ] Der Seitentitel heißt „Songdex", nicht mehr „Coversongs"
- [ ] Die Playground-Route `/test` ist aus der Navigation ausgenommen

---

## E2 — Entdeckung

**Priorität: Now** · Meilenstein 1 zusammen mit E1

> Bei < 200 Songs (NFR-1) passiert Suchen, Filtern und Sortieren clientseitig im Store. Keine Server-Paginierung.

### E2.1 — Volltextsuche · S

> Als Nutzer will ich einen Song über einen Titel- oder Artist-Fetzen finden.

- [ ] Suchfeld über der Liste, Treffer aktualisieren sich während der Eingabe (entprellt)
- [ ] Sucht in Titel und Artist, ohne Beachtung von Groß-/Kleinschreibung
- [ ] Mehrere Suchbegriffe sind UND-verknüpft, Reihenfolge egal
- [ ] Treffer-Anzahl wird angezeigt
- [ ] Leeres Ergebnis zeigt einen verständlichen Hinweis statt einer leeren Tabelle
- [ ] Suchfeld ist mit einem Klick leerbar

### E2.2 — Filtern · M

> Als Nutzer will ich die Liste nach Tags und Attributen eingrenzen.

- [ ] Filter nach Tags (Mehrfachauswahl), Tonart, Genre, Jahrzehnt und Sprache
- [ ] Filter sind untereinander UND-verknüpft, Mehrfachauswahl innerhalb eines Filters ist ODER
- [ ] Aktive Filter werden als entfernbare Chips angezeigt
- [ ] „Alle Filter zurücksetzen"
- [ ] Filter und Suche wirken zusammen
- [ ] Der Filterzustand steht in der URL und ist damit teil- und wiederherstellbar

### E2.3 — Sortieren · S

> Als Nutzer will ich die Liste nach jeder Spalte sortieren.

- [ ] Klick auf den Spaltenkopf sortiert aufsteigend, erneuter Klick absteigend
- [ ] Die aktive Sortierung ist am Spaltenkopf sichtbar
- [ ] Leere Werte landen konsistent am Ende
- [ ] Sortierung nach Text beachtet deutsche Umlaute korrekt

### E2.4 — Spalten konfigurieren · S

> Als Nutzer will ich nur die Spalten sehen, die mich interessieren.

- [ ] Menü zum Ein-/Ausblenden der Spalten
- [ ] Titel ist nicht ausblendbar
- [ ] Die Auswahl überlebt einen Reload (localStorage genügt)
- [ ] „Auf Standard zurücksetzen"

### E2.5 — Zufall & Inspiration · S

> Als Nutzer will ich mir einen Song vorschlagen lassen, wenn mir nichts einfällt.

- [ ] „Überrasch mich" öffnet einen zufälligen Song aus dem **aktuell gefilterten** Bestand
- [ ] Zweiter Vorschlag ist nicht derselbe Song
- [ ] Separater Einstieg: zufälliger Song **ohne Tags** — hilft beim Aufräumen des Katalogs

### E2.6 — Suche im Liedtext · S

> Als Nutzer will ich einen Song über eine Textzeile finden, an die ich mich erinnere.

- [ ] Die Volltextsuche erfasst zusätzlich den Liedtext aller Chordsheets eines Songs
- [ ] ChordPro-Direktiven und Akkordmarkierungen werden dabei ignoriert — gesucht wird im reinen Text
- [ ] Treffer im Liedtext sind in der Ergebnisliste als solche erkennbar

**Hängt an:** E3.1, E3.2

---

## E3 — Chordsheets & Editor

**Priorität: Next**

> Offene Entscheidung vorab klären: eigener ChordPro-Parser oder Fremdbibliothek (siehe Requirements §6). Die Antwort verschiebt den Aufwand von E3.2, E3.5 und E3.6 erheblich.

### E3.1 — Chordsheet-Entität & API · M

> Als Nutzer will ich zu einem Song mehrere Sheet-Varianten speichern.

- [ ] `Chordsheet` (`id`, `songId`, `variantName`, `chordProContent`, `createdAt`, `updatedAt`) mit Migration
- [ ] 1:n zu Song; Löschen eines Songs löscht seine Sheets
- [ ] CRUD-API unterhalb des Songs
- [ ] `variantName` ist je Song eindeutig
- [ ] Ein Song ohne Sheet ist gültig

### E3.2 — ChordPro parsen & rendern · L

> Als Nutzer will ich mein Sheet lesbar gesetzt sehen, mit Akkorden über den richtigen Silben.

- [ ] Akkorde `[G]` stehen exakt über der Textstelle, an der sie notiert sind
- [ ] Sektionsdirektiven (`start_of_verse`, `start_of_chorus`, `start_of_bridge`) werden als abgesetzte Blöcke mit Beschriftung gerendert
- [ ] Metadaten-Direktiven (`title`, `artist`, `key`, `tempo`, `capo`) werden erkannt
- [ ] Kommentare (`{comment: ...}`) werden abgesetzt dargestellt
- [ ] Unbekannte Direktiven brechen das Rendering nicht ab
- [ ] Reine Akkordzeilen ohne Text funktionieren (Intro, Solo)
- [ ] Unit-Tests für den Parser mit realen Beispiel-Sheets

### E3.3 — Split-View-Editor · L

> Als Nutzer will ich mein Sheet schreiben und das Ergebnis sofort sehen.

- [ ] Zweispaltig: links ChordPro-Quelltext, rechts gerenderte Vorschau
- [ ] Syntax-Highlighting für Akkorde, Direktiven und Kommentare
- [ ] Vorschau aktualisiert sich während der Eingabe (entprellt), ohne dass der Cursor springt
- [ ] Die Trennlinie zwischen den Spalten ist verschiebbar
- [ ] Speichern per Tastenkürzel
- [ ] Ungespeicherte Änderungen lösen beim Verlassen eine Nachfrage aus
- [ ] Ein Syntaxfehler zerstört nicht die Vorschau, sondern wird markiert

### E3.4 — Varianten verwalten · S

> Als Nutzer will ich die Sheet-Varianten eines Songs organisieren.

- [ ] Reiter oder Auswahlliste der Varianten in der Song-Detailansicht
- [ ] Variante anlegen, umbenennen, duplizieren, löschen
- [ ] Duplizieren schlägt einen freien Namen vor
- [ ] Löschen fragt nach

### E3.5 — Wunsch-Tonart als Default · S

> Als Nutzer will ich, dass ein Sheet automatisch in meiner Tonart erscheint.

- [ ] Ist `preferredKey` gesetzt und weicht von `originalKey` ab, wird die Anzeige transponiert
- [ ] Die angezeigte Tonart und die Abweichung zum Original sind sichtbar („E → G, +3")
- [ ] Der gespeicherte ChordPro-Text bleibt unverändert im Original

**Hängt an:** E3.2

### E3.6 — Spontan transponieren · M

> Als Nutzer will ich ein Sheet kurzfristig höher oder tiefer anzeigen lassen.

- [ ] ± Halbton-Schaltflächen in der Sheet-Ansicht
- [ ] Zurücksetzen auf die Wunsch-Tonart
- [ ] Enharmonische Verwechslung wird sinnvoll gewählt (Fis statt Ges, je nach Zieltonart)
- [ ] Slash-Akkorde (`D/F#`) werden in beiden Teilen transponiert
- [ ] Erweiterte Akkorde (`Cmaj7`, `F#m7b5`, `Esus4`) bleiben intakt
- [ ] Die spontane Transposition wird **nicht** gespeichert
- [ ] Unit-Tests über alle zwölf Halbtöne

**Hängt an:** E3.5

### E3.7 — Lesemodus · S

> Als Nutzer will ich ein Sheet beim Spielen gut lesen können.

- [ ] Vollbild-Ansicht ohne Editor und ohne Navigation
- [ ] Schriftgröße stufenlos verstellbar, Einstellung bleibt erhalten
- [ ] Transponier- und Tonart-Anzeige bleiben erreichbar

---

## E4 — PDF-Export

**Priorität: Next**

> Offene Entscheidung vorab klären: Browser-Druck mit Print-Stylesheet, clientseitige PDF-Bibliothek oder serverseitige Erzeugung (siehe Requirements §6).

### E4.1 — Einzelnes Songsheet als PDF · M

> Als Nutzer will ich ein Sheet ausdrucken.

- [ ] Export-Schaltfläche in der Sheet-Ansicht
- [ ] A4 Hochformat mit vernünftigen Rändern
- [ ] Kopfbereich mit Titel, Artist und Tonart
- [ ] Sektionen werden nicht mitten im Block umbrochen, wenn es vermeidbar ist
- [ ] Akkorde stehen im PDF exakt so über dem Text wie in der Vorschau
- [ ] Mehrseitige Sheets haben eine Seitennummerierung
- [ ] Der Dateiname ergibt sich aus Artist und Titel

### E4.2 — Export in der gewählten Tonart · S

> Als Nutzer will ich das PDF in der Tonart, die ich gerade sehe.

- [ ] Der Export übernimmt die aktuell angezeigte Transposition
- [ ] Die Tonart steht im Kopfbereich des PDF

**Hängt an:** E3.6, E4.1

### E4.3 — Layout-Optionen · M

> Als Nutzer will ich das Druckbild an den Song anpassen.

- [ ] Vor dem Export einstellbar: Schriftgröße, ein- oder zweispaltig, Akkorde ein-/ausblenden
- [ ] Die Vorschau zeigt die Auswirkung der Einstellungen
- [ ] Die zuletzt gewählten Einstellungen sind beim nächsten Export vorbelegt
- [ ] „Akkorde aus" erzeugt ein reines Textblatt

---

## E5 — Import, Export & Backup

**Priorität: Next**

> NFR-3: Das Docker-Volume allein ist kein akzeptables Backup. E5.3 und E5.4 sind Pflicht, nicht Komfort.

### E5.1 — CSV/JSON-Import · M

> Als Nutzer will ich eine bestehende Songliste übernehmen, ohne alles abzutippen.

- [ ] Datei auswählen, Format wird erkannt
- [ ] Spalten der Datei werden den Song-Feldern zugeordnet (Vorschlag + manuelle Korrektur)
- [ ] Vorschau vor dem Schreiben: was wird neu angelegt, was übersprungen
- [ ] Dubletten-Erkennung über Titel + Artist, mit Wahl zwischen Überspringen und Anlegen
- [ ] Zeilen mit Fehlern werden benannt und blockieren nicht den Rest
- [ ] Nach dem Import: Zusammenfassung mit Anzahlen

### E5.2 — ChordPro-Dateien importieren · M

> Als Nutzer will ich meine vorhandenen `.cho`-Dateien einlesen.

- [ ] Mehrfachauswahl von Dateien
- [ ] `title`, `artist` und `key` werden aus den Direktiven übernommen
- [ ] Existiert der Song bereits, wird das Sheet als neue Variante angehängt statt einen zweiten Song anzulegen
- [ ] Der Variantenname wird aus dem Dateinamen abgeleitet
- [ ] Dateien ohne `{title}` werden mit Hinweis übersprungen

**Hängt an:** E3.1

### E5.3 — Vollständiger Export · S

> Als Nutzer will ich jederzeit ein Backup meiner Daten ziehen können.

- [ ] Eine JSON-Datei mit allen Songs, Tags und Chordsheets
- [ ] Enthält eine Formatversion und einen Zeitstempel
- [ ] Zusätzlich: Download aller Sheets als ChordPro-Dateien in einem ZIP
- [ ] Der Export ist aus der Oberfläche heraus mit einem Klick erreichbar

### E5.4 — Restore · M

> Als Nutzer will ich ein Backup wieder einspielen.

- [ ] Import einer Export-Datei aus E5.3
- [ ] Wahl zwischen Ersetzen und Zusammenführen, mit deutlicher Warnung beim Ersetzen
- [ ] Formatversion wird geprüft; inkompatible Dateien werden abgewiesen
- [ ] Vorschau mit Anzahlen vor dem Schreiben
- [ ] Der Vorgang ist atomar — ein Fehler hinterlässt keinen halben Zustand

**Hängt an:** E5.3

---

## E6 — Setlists

**Priorität: Later** · bewusst nicht ausspezifiziert

Setlist-Planung ist einer der drei Kernnutzen, aber die Detailtiefe soll erst entschieden werden, wenn Katalog und Editor stehen und klar ist, wie sich das Tool im Alltag anfühlt.

**Zu klären, bevor Stories geschnitten werden:**

- Braucht eine Setlist Gig-Metadaten (Datum, Ort, Anlass) oder reicht ein Name?
- Mehrere Sets pro Gig (Set 1 / Pause / Set 2 / Zugaben) oder eine flache Liste?
- Soll die Gesamtdauer aus `durationSeconds` berechnet werden? Dann muss das Feld verlässlich gepflegt sein.
- Setlist-PDF: Booklet mit allen Sheets in Reihenfolge, oder einseitiger Spickzettel mit Titel und Tonart fürs Pult? (Beim PDF-Export wurde zunächst nur das Einzel-Sheet beauftragt.)
- Bleiben gespielte Setlists als Historie erhalten?
- Welche Sheet-Variante zieht eine Setlist, wenn ein Song mehrere hat?

---

## Tech-Track

Unabhängig von den Feature-Epics priorisiert. **T-1 bis T-4 blockieren Meilenstein 1.**

### Blocker für Meilenstein 1

| ID | Thema | Größe |
|---|---|---|
| **T-1** | **Environments einführen.** Es gibt keine `src/environments/`; die API-Basis-URL ist in `services/song.service.ts` hart auf `http://localhost:5286` verdrahtet. **Das Docker-Image kann das Backend damit gar nicht erreichen** — es fällt nur niemandem auf, weil die Antwort ohnehin verworfen wird. Blockiert E1.3 und NFR-7. | S |
| **T-2** | **`ISongRepository` um Schreiboperationen erweitern.** Kennt heute nur `GetAll()`. Blockiert E1.2. | S |
| **T-3** | **Doppelte API konsolidieren.** `CoversongsController` (`/api/coversongs`, funktioniert) und die Minimal-API-Gruppe (`/api/songs`, überwiegend Stubs) existieren parallel. Eine davon gewinnt, die andere verschwindet. | S |
| **T-4** | **`/api/artists`-Stubs entfernen.** Fünf Endpoints für eine Entität, die es nicht gibt und laut Requirements auch nicht geben soll. | S |

### Qualität & Korrektheit

| ID | Thema | Größe |
|---|---|---|
| T-5 | **Sync-over-async beseitigen.** `SongsService.GetAllSongs()` ruft `songRepository.GetAll().Result` — blockierend. Signatur auf `async` umstellen, `ISongsService` mitziehen. | S |
| T-6 | **Backend-Testprojekte füllen.** Alle fünf `*.Test`-Projekte enthalten keine einzige `.cs`-Datei. Mindestens Domain und Application abdecken. | M |
| T-7 | **Result-Pattern tatsächlich verwenden.** `Common/Result.cs` ist deklariert, aber nirgends benutzt. Use-Cases darauf umstellen. *(aus `Todos.backend.md`)* | M |
| T-8 | **Integrationstest REST → Datenbank.** *(aus `Todos.backend.md`)* | M |
| T-9 | **Coverage aktivieren.** Läuft nur auf Zuruf (`ng test --coverage`), ohne Schwellwerte. `coverageThresholds` im `test`-Target setzen. | S |
| T-10 | **CI einrichten.** Kein `.github/`, kein Workflow. Build, Lint und Tests für beide Teile bei jedem Push. | M |
| T-11 | **Platzhalter-Tests ersetzen.** Vier der sechs Spec-Dateien im Frontend sind unveränderte CLI-Smoke-Tests („should create"). | S |

### Defekte

| ID | Thema | Größe |
|---|---|---|
| T-12 | **Zurück-Link ist relativ.** `routerLink="songs"` in `songdetails.component.html` löst von `/songs/:id` zu `/songs/:id/songs` auf. | S |
| T-13 | **Tastaturbedienung der Songliste.** Zeilennavigation hängt an `(click)` auf `<tr>` ohne Tastatur-Äquivalent (`songlist.component.html`). Verletzt NFR-5. | S |
| T-14 | **Legacy-Namensgebung `coversongs`.** Zieht sich durch `dist/coversongs-frontend` (angular.json + Dockerfile), `nginx.conf`, Seitentitel und API-Pfad. | S |
| T-15 | **Playground-Route entfernen.** `/test` ist eine daisyUI-Spielwiese, die nicht in die ausgelieferte App gehört. | S |

### Lernthemen *(aus `Todos.frontend.md` / `Todos.backend.md`)*

| ID | Thema | Größe |
|---|---|---|
| T-16 | Signals statt Observables — `songdetails.component.ts` nutzt noch `ngOnInit` + manuelles `subscribe` | M |
| T-17 | `httpResource`-API einsetzen | M |
| ~~T-18~~ | ~~Migration Jest → Vitest~~ — erledigt: `@angular/build:unit-test` mit Vitest-Runner | M |
| T-19 | Tailwind 3 → 4 | M |
| T-20 | Playwright für E2E einführen | M |
| T-21 | .NET 8 → 9 | S |
| T-22 | Backend-Formatierung: Zeilenlänge, Umbrüche | S |

### In Feature-Epics aufgegangen *(ebenfalls aus den Todos-Dateien)*

| Ursprüngliche Zeile | Jetzt |
|---|---|
| „Get Songs from backend" *(frontend)* | E1.3 |
| „add minimal endpoints to WebApi" *(backend)* | E1.2, T-3 |
| „list songs" *(backend)* | E1.3 |
| „add song" *(backend)* | E1.4 |
| „custom tags" *(backend)* | E1.7, E1.8 |

### Bereits erledigt *(zur Dokumentation beim Konsolidieren der Todos-Dateien)*

- [x] Upgrade auf Angular 21
- [x] Migration auf Standalone Components
- [x] Upgrade auf Biome v2
- [x] Extension-Methoden für alle Backend-Projekte
- [x] Seeding über Initializer-Klasse (`LocalDatabaseInitializer.cs` — war in `Todos.backend.md` fälschlich noch offen)
