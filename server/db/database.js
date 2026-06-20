import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'soirees-ici.db');

let db;

/**
 * Initialise la connexion à la base de données SQLite.
 * Crée les tables si elles n'existent pas.
 */
export function initDatabase() {
  db = new Database(DB_PATH);

  // Active les clés étrangères
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Exécute le schéma SQL
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);

  console.log('✅ Base de données initialisée avec succès');

  // Migrations incrémentales pour les colonnes ajoutées
  runMigrations();

  // Seed les équipements si la table est vide
  seedEquipment();

  return db;
}

/**
 * Migrations incrémentales — ajoute les colonnes manquantes
 * de manière idempotente (ignore si elles existent déjà).
 */
function runMigrations() {
  const migrations = [
    // Orders: totaux calculés
    { table: 'orders', column: 'total_rental_cents', sql: 'ALTER TABLE orders ADD COLUMN total_rental_cents INTEGER DEFAULT 0' },
    { table: 'orders', column: 'total_deposit_cents', sql: 'ALTER TABLE orders ADD COLUMN total_deposit_cents INTEGER DEFAULT 0' },
    { table: 'orders', column: 'stripe_invoice_id', sql: 'ALTER TABLE orders ADD COLUMN stripe_invoice_id TEXT' },
    // Equipment: caution en centimes
    { table: 'equipment', column: 'caution_cents', sql: 'ALTER TABLE equipment ADD COLUMN caution_cents INTEGER DEFAULT 0' },
    // Order items: prix et caution en centimes
    { table: 'order_items', column: 'unit_price_cents', sql: 'ALTER TABLE order_items ADD COLUMN unit_price_cents INTEGER DEFAULT 0' },
    { table: 'order_items', column: 'caution_cents', sql: 'ALTER TABLE order_items ADD COLUMN caution_cents INTEGER DEFAULT 0' },
  ];

  for (const migration of migrations) {
    try {
      // Check if column exists
      const columns = db.prepare(`PRAGMA table_info(${migration.table})`).all();
      const exists = columns.some(col => col.name === migration.column);
      if (!exists) {
        db.exec(migration.sql);
        console.log(`📐 Migration: ajout colonne ${migration.table}.${migration.column}`);
      }
    } catch (err) {
      // Column likely already exists
      if (!err.message.includes('duplicate column')) {
        console.error(`⚠️ Migration error (${migration.column}):`, err.message);
      }
    }
  }
}

/**
 * Retourne l'instance de la base de données.
 */
export function getDb() {
  if (!db) {
    throw new Error('La base de données n\'a pas été initialisée. Appelez initDatabase() d\'abord.');
  }
  return db;
}

/**
 * Parse un texte de caution pour extraire le montant en centimes.
 * Ex: "50€ de caution par tonnelle" → 5000
 *     "100€ de caution" → 10000
 *     "" → 0
 */
function parseCautionCents(cautionText) {
  if (!cautionText) return 0;
  const match = cautionText.match(/(\d+)€/);
  return match ? parseInt(match[1], 10) * 100 : 0;
}

/**
 * Seed les équipements depuis le catalogue.
 * Ne crée que les équipements qui n'existent pas encore.
 */
function seedEquipment() {
  const equipments = [
    { name: 'Tonnelle PopUp - 3x3',              price: '25€',       price_cents: 2500,  caution: '50€ de caution par tonnelle',                      caution_cents: 5000,  image: '/fonts/location/tonnelle-popup-3x3.jpeg',           stock_total: 4 },
    { name: 'Tonnelle PopUp - 3x6',              price: '45€',       price_cents: 4500,  caution: '50€ de caution par tonnelle',                      caution_cents: 5000,  image: '/fonts/location/tonnelle-popup-3x6.jpeg',           stock_total: 2 },
    { name: 'Gobelets 25cl',                     price: '0.10€',     price_cents: 10,    caution: '',                                                 caution_cents: 0,     image: '/fonts/location/gobelet-reutilisable-25cl.png',     stock_total: 500 },
    { name: 'Gobelets 30cl',                     price: '0.15€',     price_cents: 15,    caution: '',                                                 caution_cents: 0,     image: '/fonts/location/gobelet-reutilisable-30cl.png',     stock_total: 500 },
    { name: 'Canon à chaleur (capacité 250m²)',  price: '75€',       price_cents: 7500,  caution: '100€ de caution par canon (sans combustible)',      caution_cents: 10000, image: '/fonts/location/canon-a-chaleur-250m2.png',         stock_total: 2 },
    { name: 'Mange debout',                      price: '5€',        price_cents: 500,   caution: '10€ de caution. Nappe noire: 2€ par pièce',        caution_cents: 1000,  image: '/fonts/location/mange-debout-nappe-noire.png',      stock_total: 20 },
    { name: 'Verre à Vin réutilisable',          price: '0.25€',     price_cents: 25,    caution: '',                                                 caution_cents: 0,     image: '/fonts/location/verre-a-vin-reutilisable.png',      stock_total: 200 },
    { name: 'Verre à cocktail réutilisable',     price: '0.20€',     price_cents: 20,    caution: '',                                                 caution_cents: 0,     image: '/fonts/location/verre-a-cocktail-reutilisable.png', stock_total: 200 },
    { name: 'Bar en Palette modulable',          price: '150€',      price_cents: 15000, caution: '25€ de caution par palette',                       caution_cents: 2500,  image: '/fonts/location/bar-en-palette-modulable.png',      stock_total: 3 },
    { name: 'Congélateur Bahut grand',           price: '50€',       price_cents: 5000,  caution: '100€ de caution',                                  caution_cents: 10000, image: '/fonts/location/congelateur-bahut-grand.png',       stock_total: 2 },
    { name: 'Congélateur Bahut petit',           price: '25€',       price_cents: 2500,  caution: '50€ de caution',                                   caution_cents: 5000,  image: '/fonts/location/congelateur-bahut-petit.png',       stock_total: 2 },
    { name: 'Kicker',                            price: '30€',       price_cents: 3000,  caution: '50€ de caution',                                   caution_cents: 5000,  image: '/fonts/location/kicker-baby-foot.png',              stock_total: 1 },
    { name: 'Contrôleur FLX 6 GT PIONEER',       price: '250€',      price_cents: 25000, caution: '250€ de caution',                                  caution_cents: 25000, image: '/fonts/location/controleur-pioneer-flx6-gt.png',    stock_total: 1 },
  ];

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO equipment (name, price, price_cents, caution, caution_cents, image, stock_total)
    VALUES (@name, @price, @price_cents, @caution, @caution_cents, @image, @stock_total)
  `);

  // Also update caution_cents for existing equipment that may not have it set
  const updateCautionStmt = db.prepare(`
    UPDATE equipment SET caution_cents = ? WHERE name = ? AND caution_cents = 0
  `);

  const insertMany = db.transaction((items) => {
    let inserted = 0;
    for (const item of items) {
      const result = insertStmt.run(item);
      if (result.changes > 0) {
        inserted++;
      } else {
        // Equipment already exists — update caution_cents if missing
        updateCautionStmt.run(item.caution_cents, item.name);
      }
    }
    return inserted;
  });

  const count = insertMany(equipments);
  if (count > 0) {
    console.log(`📦 ${count} équipements ajoutés au catalogue`);
  }
}

/**
 * Ferme proprement la connexion à la base.
 */
export function closeDatabase() {
  if (db) {
    db.close();
    console.log('🔒 Base de données fermée');
  }
}
