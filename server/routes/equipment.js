import { Router } from 'express';
import { getAllEquipmentWithStock, updateStockTotal } from '../services/stockService.js';
import { getDb } from '../db/database.js';

const router = Router();

// ============================================================
// GET /api/equipment — Liste tout l'équipement avec stock
// ============================================================
router.get('/', (req, res) => {
  try {
    const equipment = getAllEquipmentWithStock();
    res.json({ success: true, equipment });
  } catch (error) {
    console.error('Erreur récupération équipement:', error);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// ============================================================
// PUT /api/equipment/:id/stock — Modifier le stock total
// (protégé par token admin dans un usage réel)
// ============================================================
router.put('/:id/stock', (req, res) => {
  try {
    const { id } = req.params;
    const { stock_total } = req.body;

    if (typeof stock_total !== 'number' || stock_total < 0) {
      return res.status(400).json({ error: 'Le stock total doit être un nombre positif.' });
    }

    updateStockTotal(parseInt(id, 10), stock_total);

    const db = getDb();
    db.prepare(`
      INSERT INTO audit_log (action, details, ip_address)
      VALUES ('STOCK_UPDATED', ?, ?)
    `).run(`Stock de l'équipement #${id} mis à jour: ${stock_total}`, req.ip);

    res.json({ success: true, message: 'Stock mis à jour.' });

  } catch (error) {
    console.error('Erreur mise à jour stock:', error);
    res.status(400).json({ error: error.message || 'Erreur lors de la mise à jour du stock.' });
  }
});

export default router;
