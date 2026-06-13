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

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO sales VALUES (
      @transaction_id, @date, @month, @quarter,
      @sku, @product_name, @category, @subcategory,
      @region, @channel, @sales_rep,
      @units_sold, @unit_price_usd, @gross_revenue_usd,
      @discount_pct, @net_revenue_usd, @cogs_usd, @gross_profit_usd
    )
  `);

  for (const row of rows) {
    stmt.run(row);
  }
  stmt.free();

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  console.log(`Seeded ${rows.length} rows into database.sqlite`);
  db.close();
}

seed().catch(console.error);