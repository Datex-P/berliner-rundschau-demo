#!/usr/bin/env bash
# =============================================================================
# TYPO3 Demo Setup — lokale Testinstanz fuer den Berliner Rundschau CMS-Adapter
#
# Voraussetzungen:
#   - Docker Desktop (laeuft)
#   - DDEV (brew install ddev/ddev/ddev)
#
# Nutzung:
#   bash scripts/setup-typo3-demo.sh
#
# Was passiert:
#   1. Erstellt ~/Desktop/typo3-demo mit DDEV + TYPO3 13
#   2. Installiert EXT:headless + EXT:news
#   3. Legt Site-Config, Seiten, Kategorien und 3 Demo-Artikel an
#   4. Erstellt .env.local in diesem Projekt (berliner-rundschau)
#   5. Gibt die URLs + Credentials aus
# =============================================================================

set -euo pipefail

TYPO3_DIR="$HOME/Desktop/typo3-demo"
ADMIN_USER="admin"
ADMIN_PASS="DemoPass1!"
SITE_BASE="https://typo3-demo.ddev.site"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

# ─── Preflight ───────────────────────────────────────────────────────────────

info "Preflight-Checks..."

if ! command -v docker &>/dev/null; then
  fail "Docker nicht gefunden. Bitte Docker Desktop installieren."
fi

if ! docker info &>/dev/null 2>&1; then
  fail "Docker laeuft nicht. Bitte Docker Desktop starten."
fi

if ! command -v ddev &>/dev/null; then
  warn "DDEV nicht gefunden. Installiere mit: brew install ddev/ddev/ddev"
  read -rp "Soll DDEV jetzt installiert werden? (j/n) " choice
  if [[ "$choice" =~ ^[jJyY]$ ]]; then
    brew install ddev/ddev/ddev
    ok "DDEV installiert"
  else
    fail "DDEV wird benoetigt. Abbruch."
  fi
fi

ok "Docker + DDEV verfuegbar"

# ─── Bestehendes Projekt pruefen ─────────────────────────────────────────────

if [ -d "$TYPO3_DIR" ]; then
  warn "Verzeichnis $TYPO3_DIR existiert bereits."
  read -rp "Loeschen und neu aufsetzen? (j/n) " choice
  if [[ "$choice" =~ ^[jJyY]$ ]]; then
    (cd "$TYPO3_DIR" && ddev stop --remove-data --omit-snapshot 2>/dev/null || true)
    rm -rf "$TYPO3_DIR"
    ok "Altes Projekt entfernt"
  else
    fail "Abbruch. Loesche $TYPO3_DIR manuell oder benenne es um."
  fi
fi

# ─── DDEV Projekt erstellen ──────────────────────────────────────────────────

info "Erstelle TYPO3-Projekt in $TYPO3_DIR ..."
mkdir -p "$TYPO3_DIR"
cd "$TYPO3_DIR"

ddev config \
  --project-type=typo3 \
  --php-version=8.3 \
  --docroot=public \
  --project-name=typo3-demo

ddev start
ok "DDEV laeuft"

# ─── TYPO3 installieren ─────────────────────────────────────────────────────

info "Installiere TYPO3 13 via Composer..."
ddev composer create "typo3/cms-base-distribution:^13" --no-interaction

info "TYPO3 Setup (DB + Admin-User)..."
ddev exec vendor/bin/typo3 setup \
  --driver=mysqli \
  --host=db \
  --port=3306 \
  --dbname=db \
  --username=db \
  --password=db \
  --admin-username="$ADMIN_USER" \
  --admin-user-password="$ADMIN_PASS" \
  --project-name="TYPO3 Demo" \
  --server-type=apache \
  --no-interaction \
  --force

ok "TYPO3 installiert — Backend: ${SITE_BASE}/typo3/"

# ─── Extensions installieren ────────────────────────────────────────────────

info "Installiere EXT:headless + EXT:news + headless_news..."
ddev composer require \
  friendsoftypo3/headless:^4 \
  georgringer/news:^12 \
  friendsoftypo3/headless_news:^4 \
  --no-interaction

# Extensions aktivieren
ddev exec vendor/bin/typo3 extension:setup
ddev exec vendor/bin/typo3 cache:flush

ok "Extensions installiert und aktiviert"

# ─── Site Configuration ─────────────────────────────────────────────────────

info "Erstelle Site Configuration..."
mkdir -p config/sites/main

cat > config/sites/main/config.yaml << 'YAML'
base: /
rootPageId: 1
languages:
  -
    title: Deutsch
    enabled: true
    languageId: 0
    base: /
    locale: de_DE.UTF-8
    navigationTitle: DE
    flag: de
routes: []
errorHandling: []
YAML

# Headless-Konfiguration: JSON-Responses aktivieren
# EXT:headless registriert sich automatisch wenn installiert,
# aber die Site braucht den headless-Modus
if [ -f config/sites/main/config.yaml ]; then
  # Headless-Mode Flag setzen (TYPO3 13 + EXT:headless 4.x)
  cat >> config/sites/main/config.yaml << 'YAML'
headless: true
YAML
fi

ddev exec vendor/bin/typo3 cache:flush
ok "Site Configuration erstellt"

# ─── Demo-Content via SQL ────────────────────────────────────────────────────

info "Erstelle Demo-Content (Seiten, Kategorien, News-Artikel)..."

ddev mysql << 'SQL'
-- Root-Seite (uid=1 existiert bereits, updaten)
UPDATE pages SET
  title = 'Start',
  slug = '/',
  doktype = 1,
  is_siteroot = 1,
  hidden = 0,
  deleted = 0
WHERE uid = 1;

-- News-Seite
INSERT INTO pages (pid, title, slug, doktype, sorting, hidden, deleted, crdate, tstamp)
VALUES (1, 'News', '/news', 1, 256, 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE title = VALUES(title);

SET @news_page_uid = LAST_INSERT_ID();

-- Kategorien
INSERT INTO sys_category (pid, title, hidden, deleted, crdate, tstamp)
VALUES
  (1, 'Politik', 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1, 'Wirtschaft', 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1, 'Kultur', 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

SET @cat_politik = LAST_INSERT_ID();
SET @cat_wirtschaft = @cat_politik + 1;
SET @cat_kultur = @cat_politik + 2;

-- News-Artikel
INSERT INTO tx_news_domain_model_news
  (pid, title, path_segment, teaser, bodytext, datetime, author, hidden, deleted, crdate, tstamp)
VALUES
  (@news_page_uid, 'Berlin plant neue Radwege in Mitte',
   'berlin-plant-neue-radwege-in-mitte',
   'Der Senat kuendigt den Ausbau des Radwegenetzes im Bezirk Mitte an.',
   '<p>Die Berliner Senatsverwaltung fuer Mobilitaet hat heute einen umfassenden Plan zum Ausbau der Radinfrastruktur vorgestellt. Bis 2028 sollen 50 Kilometer neue geschuetzte Radwege entstehen.</p><p>Schwerpunkt ist der Bezirk Mitte, wo besonders viele Konflikte zwischen Rad- und Autoverkehr bestehen.</p>',
   UNIX_TIMESTAMP() - 86400, 'Maria Schmidt', 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),

  (@news_page_uid, 'Startup-Szene waechst zweistellig',
   'startup-szene-waechst-zweistellig',
   'Berliner Startups verzeichnen Rekordjahr bei Finanzierungsrunden.',
   '<p>Laut einer Studie des Digitalverbands haben Berliner Startups im vergangenen Jahr ueber 8 Milliarden Euro eingeworben. Das entspricht einem Wachstum von 23 Prozent gegenueber dem Vorjahr.</p><p>Besonders stark: KI-Startups und GreenTech.</p>',
   UNIX_TIMESTAMP() - 172800, 'Thomas Weber', 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),

  (@news_page_uid, 'Neue Ausstellung im Hamburger Bahnhof',
   'neue-ausstellung-im-hamburger-bahnhof',
   'Retrospektive zeigt 40 Jahre zeitgenoessische Kunst aus Berlin.',
   '<p>Der Hamburger Bahnhof eroeffnet am kommenden Freitag eine grosse Retrospektive zur Berliner Kunstszene seit der Wiedervereinigung. Ueber 200 Werke von 60 Kuenstlerinnen und Kuenstlern werden gezeigt.</p>',
   UNIX_TIMESTAMP() - 259200, 'Lisa Bergmann', 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- News-IDs merken
SET @news1 = LAST_INSERT_ID();
SET @news2 = @news1 + 1;
SET @news3 = @news1 + 2;

-- Kategorie-Zuordnungen (MM-Tabelle)
INSERT INTO sys_category_record_mm (uid_local, uid_foreign, tablenames, fieldname, sorting)
VALUES
  (@cat_politik, @news1, 'tx_news_domain_model_news', 'categories', 1),
  (@cat_wirtschaft, @news2, 'tx_news_domain_model_news', 'categories', 1),
  (@cat_kultur, @news3, 'tx_news_domain_model_news', 'categories', 1);

-- News-Plugin auf der News-Seite (Content Element, TYPO3 13: CType=news_pi1)
INSERT INTO tt_content (pid, CType, header, sorting, hidden, deleted, colPos, crdate, tstamp,
  pi_flexform)
VALUES (@news_page_uid, 'news_pi1', 'News', 256, 0, 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(),
  CONCAT('<?xml version="1.0" encoding="utf-8" standalone="yes" ?>\n<T3FlexForms>\n    <data>\n        <sheet index="sDEF">\n            <language index="lDEF">\n                <field index="settings.startingpoint">\n                    <value index="vDEF">', @news_page_uid, '</value>\n                </field>\n            </language>\n        </sheet>\n    </data>\n</T3FlexForms>'));

-- TypoScript Template Record (headless + news + headless_news)
INSERT INTO sys_template (pid, title, root, clear, config, crdate, tstamp)
VALUES (1, 'Root Template', 1, 3, CONCAT(
  '@import "EXT:fluid_styled_content/Configuration/TypoScript/setup.typoscript"\n',
  '@import "EXT:headless/Configuration/TypoScript/setup.typoscript"\n',
  '@import "EXT:news/Configuration/TypoScript/setup.typoscript"\n',
  '\nplugin.tx_news.settings {\n  detailPidDetermination = flexible\n  list.paginate.itemsPerPage = 50\n}\n',
  '@import "EXT:headless_news/Configuration/TypoScript/setup.typoscript"\n',
  '\nplugin.tx_news.view {\n  templateRootPaths.100 = EXT:headless_news/Resources/Private/News/Templates/\n  partialRootPaths.100 = EXT:headless_news/Resources/Private/News/Partials/\n}\n'
), UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
SQL

ddev exec vendor/bin/typo3 cache:flush
ok "3 News-Artikel + 3 Kategorien + News-Plugin + TypoScript erstellt"

# ─── API-Test ────────────────────────────────────────────────────────────────

info "Teste Headless-API..."
sleep 2

API_RESPONSE=$(curl -sk -o /dev/null -w "%{http_code}" "${SITE_BASE}/news" 2>/dev/null || echo "000")

if [ "$API_RESPONSE" = "200" ]; then
  ok "API antwortet (HTTP 200)"

  CONTENT=$(curl -sk "${SITE_BASE}/news" 2>/dev/null)
  if echo "$CONTENT" | grep -q "news_pi1"; then
    ok "Response enthaelt News-Plugin-Daten"
    if echo "$CONTENT" | grep -q '"list"'; then
      ok "News-Liste enthaelt Artikel"
    else
      warn "News-Liste ist leer — storagePid pruefen"
    fi
  else
    warn "Response enthaelt kein News-Plugin — EXT:headless_news evtl. nicht aktiv"
    warn "Response (erste 500 Zeichen): $(echo "$CONTENT" | head -c 500)"
  fi
else
  warn "API antwortet mit HTTP $API_RESPONSE"
  warn "Moegliche Ursachen:"
  warn "  - EXT:headless nicht korrekt konfiguriert"
  warn "  - Site Configuration fehlt oder falsche rootPageId"
  warn "  - Pruefe manuell: ${SITE_BASE}/"
fi

# ─── .env.local fuer Berliner Rundschau ──────────────────────────────────────

info "Erstelle .env.local fuer Berliner Rundschau..."

ENV_FILE="${PROJECT_DIR}/.env.local"
if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "${ENV_FILE}.backup"
  warn "Bestehende .env.local gesichert als .env.local.backup"
fi

cat > "$ENV_FILE" << EOF
# TYPO3 Demo — generiert von setup-typo3-demo.sh
CMS_ADAPTER=typo3
TYPO3_URL=${SITE_BASE}
TYPO3_ARTICLE_PAGE=/news
# TYPO3_API_TOKEN=        # nicht noetig fuer lokale Demo
# TYPO3_LANG_PREFIX=      # Default: leer (Deutsch)
# TYPO3_FIELD_MAP={}      # Default-Mapping passt fuer EXT:news
REVALIDATION_SECRET=demo-secret-change-me
EOF

ok ".env.local erstellt in ${PROJECT_DIR}"

# ─── Zusammenfassung ─────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  TYPO3 Demo — Setup abgeschlossen${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}TYPO3 Backend:${NC}    ${SITE_BASE}/typo3/"
echo -e "  ${BLUE}Login:${NC}            ${ADMIN_USER} / ${ADMIN_PASS}"
echo -e "  ${BLUE}Headless API:${NC}     ${SITE_BASE}/news (JSON wenn headless aktiv)"
echo ""
echo -e "  ${BLUE}Demo-Content:${NC}     3 Artikel, 3 Kategorien, 1 News-Plugin"
echo -e "  ${BLUE}Artikel-Slugs:${NC}    berlin-plant-neue-radwege-in-mitte"
echo -e "                    startup-szene-waechst-zweistellig"
echo -e "                    neue-ausstellung-im-hamburger-bahnhof"
echo ""
echo -e "  ${YELLOW}Naechste Schritte:${NC}"
echo -e "    1. cd ${PROJECT_DIR}"
echo -e "    2. npm run dev"
echo -e "    3. http://localhost:3000 oeffnen"
echo -e "    4. Terminal pruefen: [cms] Using adapter: typo3"
echo ""
echo -e "  ${YELLOW}TYPO3 stoppen:${NC}  cd ${TYPO3_DIR} && ddev stop"
echo -e "  ${YELLOW}TYPO3 loeschen:${NC} cd ${TYPO3_DIR} && ddev delete -O && rm -rf ${TYPO3_DIR}"
echo ""
