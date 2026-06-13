const express = require('express');
const router = express.Router();
const { getDb, execRows } = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = execRows(db, `
      SELECT month, ROUND(SUM(net_revenue_usd), 2) AS net_revenue
      FROM sales
      GROUP BY month
      ORDER BY month ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;