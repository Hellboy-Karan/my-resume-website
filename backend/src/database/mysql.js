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
    await addColumnIfMissing(connection, 'resumes', 'view_count', 'BIGINT NOT NULL DEFAULT 0');
    await addColumnIfMissing(connection, 'templates', 'image_url', 'VARCHAR(500) NULL');
    await addColumnIfMissing(connection, 'users', 'profile_image_url', 'VARCHAR(500) NULL');
    await addColumnIfMissing(connection, 'users', 'phone', 'VARCHAR(40) NULL');
    await addColumnIfMissing(connection, 'users', 'address', 'VARCHAR(255) NULL');
    await addColumnIfMissing(connection, 'users', 'city', 'VARCHAR(100) NULL');
    await addColumnIfMissing(connection, 'users', 'state', 'VARCHAR(100) NULL');
    await addColumnIfMissing(connection, 'users', 'country', 'VARCHAR(100) NULL');
    await addColumnIfMissing(connection, 'users', 'postal_code', 'VARCHAR(30) NULL');
    await addColumnIfMissing(connection, 'users', 'about_me', 'TEXT NULL');
    await addColumnIfMissing(connection, 'users', 'short_description', 'TEXT NULL');
    await addColumnIfMissing(connection, 'users', 'profile_title', 'VARCHAR(180) NULL');
    await addColumnIfMissing(connection, 'users', 'professional_info', 'JSON NULL');
    await addColumnIfMissing(connection, 'users', 'certificates', 'JSON NULL');
    await addColumnIfMissing(connection, 'users', 'social_links', 'JSON NULL');
    await addColumnIfMissing(connection, 'users', 'theme_preference', "ENUM('light','dark','system') NOT NULL DEFAULT 'system'");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS app_counters (
        name VARCHAR(80) PRIMARY KEY,
        value BIGINT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS password_reset_otps (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        email VARCHAR(180) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_reset_otps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
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
