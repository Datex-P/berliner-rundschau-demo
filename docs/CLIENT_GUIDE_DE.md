# Kundenleitfaden — Berliner Rundschau

Willkommen bei Ihrer neuen Website der Berliner Rundschau! Dieses Dokument erklärt, wie Sie Inhalte verwalten und häufige Aufgaben erledigen — ganz ohne technische Vorkenntnisse.

---

## Was kann diese Website?

Die Berliner Rundschau ist ein vollständiges Nachrichtenportal mit folgenden Bereichen:

- **Startseite** — Topthema, aktuelle Nachrichten, Newsticker und Videos
- **Artikel** — Ausführliche Berichte mit Bild, Kategorie und Autor
- **Kategorien** — Sortierte Themenbereiche (z.B. Politik, Wirtschaft, Kultur)
- **Autoren** — Profilseiten mit Kurzbiografie und Artikelliste
- **Suche** — Volltextsuche über alle Artikel
- **Dunkler Modus** — Automatisch oder manuell umschaltbar
- **Premium-Inhalte** — Bezahlschranke für ausgewählte Artikel

---

## Inhalte bearbeiten

### Wie werden Inhalte verwaltet?

Diese Website verwendet derzeit **Demo-Inhalte**, die direkt im Quellcode hinterlegt sind. Um neue Artikel, Kategorien oder Autoren zu veröffentlichen, benötigen Sie einen Entwickler, der die Inhalte in der Datei `src/lib/mock.ts` anpasst oder das System an ein Redaktionssystem (CMS) anschließt.

> **Empfehlung:** Für eine eigenständige Inhaltsverwaltung empfehlen wir die Anbindung an ein CMS wie Contentful, Storyblok oder WordPress. Sprechen Sie Ihren Entwickler darauf an.

---

## Inhalts-Typen

### Artikel

Ein Artikel besteht aus folgenden Feldern:

| Bezeichnung | Beschreibung | Pflicht |
|-------------|-------------|---------|
| Überschrift | Titel des Artikels | Ja |
| Teaser | Kurzzusammenfassung (1-2 Sätze) | Ja |
| Inhalt | Ausführlicher Artikeltext | Ja |
| Bild | Hauptbild mit Bildbeschreibung | Ja |
| Kategorie | Themenbereich (z.B. Politik) | Ja |
| Autor | Verfasser des Artikels | Ja |
| Schlagwörter | Themenbegriffe (Komma-getrennt) | Nein |
| Lesedauer | Geschätzte Lesezeit in Minuten | Nein |
| Premium | Ist der Artikel kostenpflichtig? | Nein |
| Eilmeldung | Wird als Breaking News angezeigt | Nein |
| Meinung | Kennzeichnung als Meinungsartikel | Nein |
| Topthema | Wird auf der Startseite großformatig angezeigt | Nein |

### Kategorien

Eine Kategorie hat folgende Felder:

| Bezeichnung | Beschreibung |
|-------------|-------------|
| Name | Anzeigename (z.B. Politik, Wirtschaft) |
| Beschreibung | Kurze Einführung zur Kategorie |
| Farbe | Akzentfarbe für die Kategorie |
| Unterkategorien | Optionale Unterthemen |

### Autoren

Ein Autor hat folgende Felder:

| Bezeichnung | Beschreibung |
|-------------|-------------|
| Name | Vollständiger Name |
| Kurzbiografie | Beschreibungstext für die Profilseite |
| Rolle | z.B. Redakteur, Chefredakteur |
| Profilbild | Quadratisches Foto (empfohlen: 200×200 Pixel) |

### Eilmeldungen

Eilmeldungen erscheinen prominent auf der Startseite:

| Bezeichnung | Beschreibung |
|-------------|-------------|
| Überschrift | Kurzer, prägnanter Text |
| Link | Zielartikel |
| Schweregrad | "Eilmeldung" oder "Hinweis" |
| Ablaufzeit | Optional: Wann soll die Meldung verschwinden? |

---

## Bilder

### Empfohlene Bildgrößen

| Verwendung | Breite × Höhe | Format |
|-----------|--------------|--------|
| Artikel-Hauptbild | 1200 × 675 Pixel | JPG oder WebP |
| Teaser-/Kartenbild | 800 × 450 Pixel | JPG oder WebP |
| Autorenprofilbild | 200 × 200 Pixel | JPG oder WebP |
| Video-Vorschaubild | 640 × 360 Pixel | JPG oder WebP |

### Bildregeln

- Verwenden Sie immer eine **Bildbeschreibung** (Alt-Text), damit sehbehinderte Nutzer den Inhalt verstehen
- Maximale Dateigröße: **2 MB** pro Bild
- Bevorzugen Sie **JPG** für Fotos und **PNG** für Grafiken mit Text oder transparentem Hintergrund
- Bilder werden automatisch für verschiedene Bildschirmgrößen optimiert

---

## Häufige Aufgaben

### Wie erstelle ich einen neuen Artikel?

Da diese Website Demo-Inhalte verwendet, können Artikel derzeit nur von einem Entwickler hinzugefügt werden. Nach der Anbindung an ein CMS können Sie Artikel direkt im Browser verfassen.

Benötigte Informationen für einen neuen Artikel:
1. Überschrift und Teaser
2. Ausführlicher Text
3. Hauptbild (1200×675 Pixel)
4. Kategorie auswählen
5. Autor zuweisen
6. Schlagwörter vergeben
7. Premium-Status festlegen (kostenlos, kostenpflichtig oder begrenzt frei)

### Wie ändere ich ein Bild?

Bilder können derzeit nur durch einen Entwickler ausgetauscht werden. Stellen Sie dem Entwickler das neue Bild in der empfohlenen Größe bereit und nennen Sie den zugehörigen Artikel.

### Wie ändere ich die Navigation?

Die Navigation (Hauptmenü und Footer-Links) kann derzeit nur durch einen Entwickler geändert werden. Teilen Sie dem Entwickler mit, welche Kategorien und Links erscheinen sollen.

### Welche Felder sind Pflicht?

Bei Artikeln müssen mindestens **Überschrift, Teaser, Inhalt, Bild, Kategorie und Autor** angegeben sein.

---

## Was können Sie selbst ändern / was braucht Entwickler-Hilfe?

| Aufgabe | Selbst möglich | Entwickler nötig |
|---------|---------------|-----------------|
| Neuen Artikel schreiben | Nach CMS-Anbindung: Ja | Derzeit: Ja |
| Bild austauschen | Nach CMS-Anbindung: Ja | Derzeit: Ja |
| Navigation anpassen | Nach CMS-Anbindung: Ja | Derzeit: Ja |
| Kategorien hinzufügen | Nach CMS-Anbindung: Ja | Derzeit: Ja |
| Farben / Design ändern | Nein | Ja |
| Neue Seitenfunktionen | Nein | Ja |
| Domain ändern | Nein | Ja |
| Premium-Preise festlegen | Nein | Ja |

---

## Datenschutz & Impressum

Die Website enthält Seiten für **Datenschutzerklärung** (`/datenschutz`) und **Impressum** (`/impressum`). Diese Texte müssen von Ihnen oder einem Rechtsberater ausgefüllt werden, bevor die Website live geht.

> **Wichtig:** Als deutsches Medienunternehmen sind Sie gesetzlich verpflichtet, ein vollständiges Impressum und eine aktuelle Datenschutzerklärung zu veröffentlichen.

---

## Support

Bei technischen Fragen oder Wünschen wenden Sie sich an Ihren Entwickler oder die betreuende Agentur.
