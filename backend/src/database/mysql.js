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
    await connection.query('ALTER TABLE resumes ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500) NULL');
    await connection.query('ALTER TABLE templates ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL');
  } finally {
    connection.release();
  }
}
