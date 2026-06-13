const express = require('express');
const router = express.Router();
const { getDb, execRows } = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = execRows(db, `
      SELECT product_name, sku, category,
        ROUND(SUM(net_revenue_usd), 2) AS total_net_revenue,
        SUM(units_sold) AS total_units_sold
      FROM sales
      GROUP BY sku
      ORDER BY total_net_revenue DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;