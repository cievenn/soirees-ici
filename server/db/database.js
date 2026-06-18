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

  // Seed les équipements si la table est vide
  seedEquipment();

  return db;
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
 * Seed les équipements depuis le catalogue.
 * Ne crée que les équipements qui n'existent pas encore.
 */
function seedEquipment() {
  const equipments = [
    { name: 'Tonnelle PopUp - 3x3',              price: '25€',       caution: '50€ de caution par tonnelle',                      image: '/fonts/location/tonnelle-popup-3x3.jpeg',           stock_total: 4 },
    { name: 'Tonnelle PopUp - 3x6',              price: '45€',       caution: '50€ de caution par tonnelle',                      image: '/fonts/location/tonnelle-popup-3x6.jpeg',           stock_total: 2 },
    { name: 'Gobelets 25cl',                     price: 'Sur devis', caution: '',                                                 image: '/fonts/location/gobelet-reutilisable-25cl.png',     stock_total: 500 },
    { name: 'Gobelets 30cl',                     price: 'Sur devis', caution: '',                                                 image: '/fonts/location/gobelet-reutilisable-30cl.png',     stock_total: 500 },
    { name: 'Canon à chaleur (capacité 250m²)',  price: '75€',       caution: '100€ de caution par canon (sans combustible)',      image: '/fonts/location/canon-a-chaleur-250m2.png',         stock_total: 2 },
    { name: 'Mange debout',                      price: '5€',        caution: '10€ de caution. Nappe noire: 2€ par pièce',        image: '/fonts/location/mange-debout-nappe-noire.png',      stock_total: 20 },
    { name: 'Verre à Vin réutilisable',          price: 'Sur devis', caution: '',                                                 image: '/fonts/location/verre-a-vin-reutilisable.png',      stock_total: 200 },
    { name: 'Verre à cocktail réutilisable',     price: 'Sur devis', caution: '',                                                 image: '/fonts/location/verre-a-cocktail-reutilisable.png', stock_total: 200 },
    { name: 'Bar en Palette modulable',          price: '150€',      caution: '25€ de caution par palette',                       image: '/fonts/location/bar-en-palette-modulable.png',      stock_total: 3 },
    { name: 'Congélateur Bahut grand',           price: '50€',       caution: '100€ de caution',                                  image: '/fonts/location/congelateur-bahut-grand.png',       stock_total: 2 },
    { name: 'Congélateur Bahut petit',           price: '25€',       caution: '50€ de caution',                                   image: '/fonts/location/congelateur-bahut-petit.png',       stock_total: 2 },
    { name: 'Kicker',                            price: '30€',       caution: '50€ de caution',                                   image: '/fonts/location/kicker-baby-foot.png',              stock_total: 1 },
    { name: 'Contrôleur FLX 6 GT PIONEER',       price: '250€',      caution: '250€ de caution',                                  image: '/fonts/location/controleur-pioneer-flx6-gt.png',    stock_total: 1 },
  ];

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO equipment (name, price, caution, image, stock_total)
    VALUES (@name, @price, @caution, @image, @stock_total)
  `);

  const insertMany = db.transaction((items) => {
    let inserted = 0;
    for (const item of items) {
      const result = insertStmt.run(item);
      if (result.changes > 0) inserted++;
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
