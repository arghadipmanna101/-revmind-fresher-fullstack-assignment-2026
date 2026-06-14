const express = require('express');
const router = express.Router();
const { getDb, execRows } = require('../db');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function buildContext() {
  const db = await getDb();

  const regionRevenue = execRows(db, `
    SELECT region, ROUND(SUM(net_revenue_usd),2) as revenue
    FROM sales GROUP BY region ORDER BY revenue DESC
  `);

  const channelRevenue = execRows(db, `
    SELECT channel, ROUND(SUM(net_revenue_usd),2) as revenue
    FROM sales GROUP BY channel ORDER BY revenue DESC
  `);

  const categoryMargin = execRows(db, `
    SELECT category,
      ROUND(SUM(net_revenue_usd),2) as net_revenue,
      ROUND(SUM(gross_profit_usd),2) as gross_profit,
      ROUND(SUM(gross_profit_usd)/SUM(net_revenue_usd)*100,2) as margin_pct
    FROM sales GROUP BY category
  `);

  const repUnits = execRows(db, `
    SELECT sales_rep, SUM(units_sold) as total_units,
      ROUND(SUM(net_revenue_usd),2) as total_revenue
    FROM sales GROUP BY sales_rep ORDER BY total_units DESC
  `);

  const repUnits2025 = execRows(db, `
    SELECT sales_rep, SUM(units_sold) as total_units
    FROM sales WHERE date LIKE '2025%'
    GROUP BY sales_rep ORDER BY total_units DESC
  `);

  const quarterRegion = execRows(db, `
    SELECT quarter, region, ROUND(SUM(net_revenue_usd),2) as revenue
    FROM sales GROUP BY quarter, region ORDER BY quarter, revenue DESC
  `);

  const productRegion = execRows(db, `
    SELECT region, product_name, ROUND(SUM(net_revenue_usd),2) as revenue
    FROM sales GROUP BY region, product_name ORDER BY region, revenue DESC
  `);

  return `
=== NOVABITE SALES DATA SUMMARY ===

NET REVENUE BY REGION:
${regionRevenue.map(r => `  ${r.region}: $${r.revenue}`).join('\n')}

NET REVENUE BY CHANNEL:
${channelRevenue.map(r => `  ${r.channel}: $${r.revenue}`).join('\n')}

CATEGORY PERFORMANCE:
${categoryMargin.map(r => `  ${r.category}: Revenue=$${r.net_revenue}, Profit=$${r.gross_profit}, Margin=${r.margin_pct}%`).join('\n')}

SALES REP PERFORMANCE (all time):
${repUnits.map(r => `  ${r.sales_rep}: ${r.total_units} units, $${r.total_revenue} revenue`).join('\n')}

SALES REP UNITS IN 2025:
${repUnits2025.map(r => `  ${r.sales_rep}: ${r.total_units} units`).join('\n')}

QUARTERLY REVENUE BY REGION:
${quarterRegion.map(r => `  ${r.quarter} | ${r.region}: $${r.revenue}`).join('\n')}

TOP PRODUCTS PER REGION:
${productRegion.map(r => `  ${r.region} | ${r.product_name}: $${r.revenue}`).join('\n')}
`;
}

router.post('/', async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ success: false, error: 'question is required' });
  }

  try {
    const context = await buildContext();

    const prompt = `
You are a business intelligence assistant for NovaBite Consumer Goods.
Answer the sales manager's question using ONLY the data provided below.
Be concise, specific, and always include numbers.
If the data is insufficient, say so clearly.

${context}

Sales Manager's Question: ${question}
`;

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'LLM request failed' });
  }
});

module.exports = router;