import { query } from '../database/mysql.js';

export async function incrementCounter(name, amount = 1) {
  await query(
    `INSERT INTO app_counters (name, value)
     VALUES (:name, :amount)
     ON DUPLICATE KEY UPDATE value = value + :amount`,
    { name, amount }
  );
}

export async function getCounter(name) {
  const rows = await query('SELECT value FROM app_counters WHERE name = :name LIMIT 1', { name });
  return Number(rows[0]?.value || 0);
}
