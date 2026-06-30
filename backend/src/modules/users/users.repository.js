import { query } from '../../database/mysql.js';

function mapUser(row) {
  if (!row) return null;
  const parseJson = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch (_error) {
      return fallback;
    }
  };
  return {
    ...row,
    is_active: Boolean(row.is_active),
    feature_flags: parseJson(row.feature_flags, {}),
    professional_info: parseJson(row.professional_info, {}),
    certificates: parseJson(row.certificates, []),
    social_links: parseJson(row.social_links, [])
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
    const jsonKeys = new Set(['featureFlags', 'professional_info', 'certificates', 'social_links']);
    for (const [key, value] of Object.entries(data)) {
      const column = key === 'featureFlags' ? 'feature_flags' : key;
      fields.push(`${column} = :${key}`);
      params[key] = jsonKeys.has(key) ? JSON.stringify(value) : value;
    }
    if (fields.length) {
      await query(`UPDATE users SET ${fields.join(', ')} WHERE id = :id`, params);
    }
    return this.findById(id);
  }
}
