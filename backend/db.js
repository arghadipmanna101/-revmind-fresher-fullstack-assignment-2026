const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'database.sqlite');

let dbInstance = null;

async function getDb() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (!fs.existsSync(DB_PATH)) {
    throw new Error('Database not found. Run: node seed.js');
  }

  const fileBuffer = fs.readFileSync(DB_PATH);
  dbInstance = new SQL.Database(fileBuffer);

  // quick check
  const result = dbInstance.exec('SELECT COUNT(*) as c FROM sales');
  console.log('DB loaded, row count:', result[0].values[0][0]);

  return dbInstance;
}

function execRows(db, sql) {
  const result = db.exec(sql);
  if (!result.length) return [];
  const cols = result[0].columns;
  return result[0].values.map(r =>
    Object.fromEntries(cols.map((c, i) => [c, r[i]]))
  );
}

function execOne(db, sql) {
  const rows = execRows(db, sql);
  return rows.length ? rows[0] : null;
}

module.exports = { getDb, execRows, execOne };