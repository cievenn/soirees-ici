-- ===================================
-- Soirées Ici — Location de Matériel
-- Schéma de base de données SQLite
-- ===================================

-- Catalogue d'équipements avec gestion de stock
CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  price TEXT NOT NULL,
  price_cents INTEGER DEFAULT 0,
  caution TEXT DEFAULT '',
  caution_cents INTEGER DEFAULT 0,
  image TEXT DEFAULT '',
  stock_total INTEGER NOT NULL DEFAULT 0,
  stock_reserved INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Commandes de location
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'AWAITING_PAYMENT', 'APPROVED', 'REJECTED', 'ACTIVE', 'RETURNED', 'OVERDUE')),
  token_secret TEXT NOT NULL UNIQUE,
  token_used INTEGER DEFAULT 0,
  stripe_session_id TEXT,
  stripe_invoice_id TEXT,
  payment_deadline TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  event_location TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  notes TEXT DEFAULT '',
  total_rental_cents INTEGER DEFAULT 0,
  total_deposit_cents INTEGER DEFAULT 0,
  approved_at TEXT,
  modification_deadline TEXT,
  pickup_date TEXT,
  return_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Détail du panier de chaque commande
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  equipment_id INTEGER NOT NULL,
  equipment_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  unit_price TEXT DEFAULT '',
  unit_price_cents INTEGER DEFAULT 0,
  caution_cents INTEGER DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- Journal d'audit pour traçabilité complète
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  action TEXT NOT NULL,
  details TEXT DEFAULT '',
  ip_address TEXT DEFAULT '',
  performed_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_token ON orders(token_secret);
CREATE INDEX IF NOT EXISTS idx_orders_end_date ON orders(end_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_order ON audit_log(order_id);

-- Index pour les requêtes de chevauchement de dates (stock temporel)
CREATE INDEX IF NOT EXISTS idx_orders_dates_status ON orders(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_order_items_equipment ON order_items(equipment_id);
