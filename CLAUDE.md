# Hinweise für Agenten

Pane Cards: Kartenpaket für Home Assistant (Nachfolger der einzelnen Liquid-Glass-Karten). Ein Bundle,
alle Karten teilen Unterbau, Look und Editor-Bausteine.

> Zentrale Projekt-Übersicht: Repo `donsebby/projekte`. Bei Änderungen an Zugängen, Adressen, Ports, Deploy-Weg oder Schnittstellen zu anderen Projekten die eigene Datei dort (`projekte/ha-karten.md`) bzw. `schnittstellen.md` nachziehen.

- Quellen in `src/` (`core/` = Unterbau, `cards/` = Karten). Nie `dist/` oder `lab/` von Hand bearbeiten:
  `npm ci && npm run build` erzeugt `dist/pane-cards.js` (stabil, HACS) und `lab/pane-cards-dev.js`
  (alle Typen mit `-dev`). Beide werden mit committet; die Action „Build“ prüft, dass sie zu `src/` passen.
- Regeln für jede Karte: Look nur über Theme-Variablen (`pane-*`, siehe `src/core/style.js`), Farbe zeigt nur
  Zustand (fünf Zustandsfarben), Kopfzeile über `setHeader()`, `update()` patcht nur Geändertes
  (`setText`/`setAttr`/`setStyle`), jede Option im visuellen Editor (`PaneEditor`, ha-form mit Selektoren).
- Alte Kartentypen laufen als Alias weiter (nur wenn der Name frei ist), siehe `src/index.js`.
- Lab: Sebbos Lab-Dashboard lädt den Lab-Build (Weg steht in `donsebby/homelab` → `ha/lab-karten/`).
- Release nur nach Sebbos OK nach Lab-Test: Version in `package.json`, Changelog-Eintrag `### x.y.z` im README,
  bauen, dann `.release-approved` mit der Version committen (Action „Release“ legt Tag und Release an).
- Commits als `Sebastian Rinn <donsebby@users.noreply.github.com>`, ohne Signatur (`-c commit.gpgsign=false`),
  Nachrichten auf Englisch. Keine privaten Namen, Adressen oder Entitäten in README/Screenshots (Beispielnamen).
