import { query } from '../../database/mysql.js';

function mapUser(row) {
  if (!row) return null;
  return {
    ...row,
    is_active: Boolean(row.is_active),
    feature_flags: typeof row.feature_flags === 'string'
      ? JSON.parse(row.feature_flags || '{}')
      : row.feature_flags
  };
}

export class UserRepository {
  async create({ name, username, email, passwordHash, role = 'USER', featureFlags = null }) {
    const result = await query(
      `INSERT INTO users (name, username, email, password_hash, role, feature_flags)
       VALUES (:name, :username, :email, :passwordHash, :role, :featureFlags)`,
      { name, username, email, passwordHash, role, featureFlags: featureFlags ? JSON.stringify(featureFlags) : null }
    );
    return this.findById(result.insertId);
  }

  async findByEmail(email) {
    const rows = await query('SELECT * FROM users WHERE email = :email LIMIT 1', { email });
    return mapUser(rows[0]);
  }

  async findByUsername(username) {
    const rows = await query('SELECT * FROM users WHERE username = :username LIMIT 1', { username });
    return mapUser(rows[0]);
  }

  async findById(id) {
    const rows = await query('SELECT * FROM users WHERE id = :id LIMIT 1', { id });
    return mapUser(rows[0]);
  }

  async list() {
    const rows = await query('SELECT * FROM users ORDER BY created_at DESC');
    return rows.map(mapUser);
  }

  async update(id, data) {
    const fields = [];
    const params = { id };
    for (const [key, value] of Object.entries(data)) {
      const column = key === 'featureFlags' ? 'feature_flags' : key;
      fields.push(`${column} = :${key}`);
      params[key] = key === 'featureFlags' ? JSON.stringify(value) : value;
    }
    if (fields.length) {
      await query(`UPDATE users SET ${fields.join(', ')} WHERE id = :id`, params);
    }
    return this.findById(id);
  }
}

