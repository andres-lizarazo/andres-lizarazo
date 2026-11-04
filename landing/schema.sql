-- Esquema de la base de datos (Cloudflare D1 / SQLite).
-- Aplicar en local:   npm run db:local
-- Aplicar en remoto:  npm run db:remote
-- Es idempotente: se puede ejecutar varias veces sin perder datos.

-- Personas que dejaron su nombre y email (lead magnet o formulario de la página de venta).
CREATE TABLE IF NOT EXISTS leads (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT    NOT NULL UNIQUE,
  name            TEXT    NOT NULL,
  anon_id         TEXT,                       -- id anónimo del navegador (une lead, clics y compra)
  utm_source      TEXT,                       -- primer contacto (no se sobrescribe)
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_content     TEXT,
  utm_term        TEXT,
  referrer        TEXT,
  landing_path    TEXT,
  form_id         TEXT,                       -- qué formulario usó (gratis, venta, ...)
  country         TEXT,                       -- país según Cloudflare
  ip_hash         TEXT,                       -- hash con sal, nunca la IP en claro
  consent_at      TEXT    NOT NULL,           -- Ley 1581 de 2012: prueba de la autorización
  consent_version TEXT    NOT NULL,
  signups         INTEGER NOT NULL DEFAULT 1, -- cuántas veces se registró
  esp_synced      INTEGER NOT NULL DEFAULT 0, -- 1 = ya está en Brevo
  esp_error       TEXT,
  created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at);
CREATE INDEX IF NOT EXISTS idx_leads_ip ON leads (ip_hash, updated_at);
CREATE INDEX IF NOT EXISTS idx_leads_unsynced ON leads (esp_synced) WHERE esp_synced = 0;

-- Eventos del embudo (registro, clic en comprar, descarga, carrito abandonado...).
CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  type         TEXT NOT NULL,
  anon_id      TEXT,
  email        TEXT,
  path         TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  referrer     TEXT,
  country      TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_events_type_created ON events (type, created_at);
CREATE INDEX IF NOT EXISTS idx_events_anon ON events (anon_id);

-- Compras recibidas por webhook de Hotmart (una fila por transacción, se actualiza su estado).
CREATE TABLE IF NOT EXISTS purchases (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT NOT NULL UNIQUE,
  status         TEXT NOT NULL,       -- APPROVED, COMPLETE, REFUNDED, CHARGEBACK, CANCELED...
  status_rank    INTEGER NOT NULL DEFAULT 0, -- evita que un evento atrasado "devuelva" el estado
  last_event     TEXT NOT NULL,
  email          TEXT,
  name           TEXT,
  product_id     TEXT,
  product_name   TEXT,
  offer_code     TEXT,
  price_value    REAL,
  price_currency TEXT,
  payment_type   TEXT,
  src            TEXT,                -- fuente (utm_source) que mandamos al checkout
  sck            TEXT,                -- anon_id que mandamos al checkout
  approved_at    TEXT,
  esp_synced     INTEGER NOT NULL DEFAULT 0,
  esp_error      TEXT,
  raw            TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases (email);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases (status, approved_at);

-- Idempotencia: cada evento de webhook se procesa una sola vez.
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id    TEXT PRIMARY KEY,
  provider    TEXT NOT NULL,
  event       TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
