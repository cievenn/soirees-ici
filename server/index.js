import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initDatabase, closeDatabase } from './db/database.js';
import { initEmailService } from './services/emailService.js';
import { initCronJobs } from './services/cronService.js';
import ordersRouter from './routes/orders.js';
import equipmentRouter from './routes/equipment.js';

import stripeRouter from './routes/stripe.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Stripe webhook nécessite le raw body, il doit être défini avant express.json
app.use('/api/stripe', stripeRouter);

app.use(express.json({ limit: '1mb' }));

// ─── Rate Limiting ────────────────────────────────────────
// Global : 100 requêtes par IP toutes les 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.',
  },
});
app.use('/api/', globalLimiter);

// Création de commande : 5 requêtes par IP toutes les 15 minutes (anti-spam)
const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Trop de demandes de réservation. Veuillez réessayer dans quelques minutes.',
  },
});
app.use('/api/orders', (req, res, next) => {
  if (req.method === 'POST') {
    return orderCreationLimiter(req, res, next);
  }
  next();
});

// Actions sur les commandes : 10 requêtes par IP toutes les 15 minutes
const orderActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Trop de requêtes d\'action. Veuillez réessayer dans quelques minutes.',
  },
});
app.use('/api/orders/:id', (req, res, next) => {
  if (req.method === 'PUT') {
    return orderActionLimiter(req, res, next);
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/orders', ordersRouter);
app.use('/api/equipment', equipmentRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

// ─── Démarrage ────────────────────────────────────────────
function start() {
  // 1. Initialiser la base de données
  initDatabase();

  // 2. Initialiser le service email
  initEmailService();

  // 3. Initialiser les cron jobs
  initCronJobs();

  // 4. Lancer le serveur
  app.listen(PORT, () => {
    console.log(`\n🚀 Soirées Ici API démarrée sur http://localhost:${PORT}`);
    console.log(`📡 Frontend attendu sur ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
  });
}

// Fermeture propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

start();
