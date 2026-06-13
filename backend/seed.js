const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const { parse } = require('csv-parse/sync');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const CSV_PATH = path.join(__dirname, '../data/novabite_sales_data.csv');

async function seed() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      transaction_id TEXT PRIMARY KEY,
      date TEXT, month TEXT, quarter TEXT,
      sku TEXT, product_name TEXT,
      category TEXT, subcategory TEXT,
      region TEXT, channel TEXT, sales_rep TEXT,
      units_sold REAL, unit_price_usd REAL,
      gross_revenue_usd REAL, discount_pct REAL,
      net_revenue_usd REAL, cogs_usd REAL,
      gross_profit_usd REAL
    )
  `);

  const csv = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parse(csv, { columns: true, skip_empty_lines: true });

  for (const row of rows) {
    db.run(
      `INSERT OR IGNORE INTO sales VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        row.transaction_id,
        row.date,
        row.month,
        row.quarter,
        row.sku,
        row.product_name,
        row.category,
        row.subcategory,
        row.region,
        row.channel,
        row.sales_rep,
        parseFloat(row.units_sold),
        parseFloat(row.unit_price_usd),
        parseFloat(row.gross_revenue_usd),
        parseFloat(row.discount_pct),
        parseFloat(row.net_revenue_usd),
        parseFloat(row.cogs_usd),
        parseFloat(row.gross_profit_usd)
      ]
    );
  }

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  console.log(`Seeded ${rows.length} rows into database.sqlite`);
  db.close();
}

seed().catch(console.error);