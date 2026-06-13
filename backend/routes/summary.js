const express = require('express');
const router = express.Router();
const { getDb, execOne } = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = await getDb();

    const totals = execOne(db, `
      SELECT
        ROUND(SUM(net_revenue_usd), 2) AS total_net_revenue,
        SUM(units_sold) AS total_units,
        ROUND(SUM(gross_profit_usd) / SUM(net_revenue_usd) * 100, 2) AS gross_profit_margin_pct
      FROM sales
    `);

    const topRegion = execOne(db, `
      SELECT region FROM sales
      GROUP BY region ORDER BY SUM(net_revenue_usd) DESC LIMIT 1
    `);

    const topChannel = execOne(db, `
      SELECT channel FROM sales
      GROUP BY channel ORDER BY SUM(net_revenue_usd) DESC LIMIT 1
    `);

    const topProduct = execOne(db, `
      SELECT product_name FROM sales
      GROUP BY product_name ORDER BY SUM(net_revenue_usd) DESC LIMIT 1
    `);

    res.json({
      success: true,
      data: {
        total_net_revenue: totals.total_net_revenue,
        total_units: totals.total_units,
        gross_profit_margin_pct: totals.gross_profit_margin_pct,
        top_region: topRegion.region,
        top_channel: topChannel.channel,
        top_product: topProduct.product_name,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;