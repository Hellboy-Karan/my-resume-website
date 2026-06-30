import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import { schemaSql } from './schema.js';

let pool;

export function getMysqlPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.mysql.host,
      port: env.mysql.port,
      database: env.mysql.database,
      user: env.mysql.user,
      password: env.mysql.password,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true
    });
  }
  return pool;
}

export async function query(sql, params = {}) {
  const [rows] = await getMysqlPool().execute(sql, params);
  return rows;
}

export async function ensureMysqlSchema() {
  const bootstrap = mysql.createPool({
    host: env.mysql.host,
    port: env.mysql.port,
    user: env.mysql.user,
    password: env.mysql.password,
    waitForConnections: true,
    connectionLimit: 2,
    multipleStatements: true
  });

  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${env.mysql.database}\``);
  await bootstrap.end();

  const connection = await getMysqlPool().getConnection();
  try {
    for (const statement of schemaSql.split(';').map((s) => s.trim()).filter(Boolean)) {
      await connection.query(statement);
    }
    await addColumnIfMissing(connection, 'resumes', 'profile_image_url', 'VARCHAR(500) NULL');
    await addColumnIfMissing(connection, 'templates', 'image_url', 'VARCHAR(500) NULL');
  } finally {
    connection.release();
  }
}

async function addColumnIfMissing(connection, tableName, columnName, definition) {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
     LIMIT 1`,
    [env.mysql.database, tableName, columnName]
  );

  if (!rows.length) {
    await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
  }
}
