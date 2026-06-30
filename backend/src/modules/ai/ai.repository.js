import { query } from '../../database/mysql.js';
import { decryptSecret, encryptSecret, maskSecret } from '../../utils/crypto.js';

function mapSetting(row, includeSecret = false) {
  if (!row) return null;
  const decrypted = decryptSecret(row.encrypted_api_key);
  const apiKey = includeSecret ? decrypted : undefined;
  return {
    id: row.id,
    user_id: row.user_id,
    provider: row.provider,
    base_url: row.base_url,
    model_name: row.model_name,
    is_enabled: Boolean(row.is_enabled),
    masked_api_key: maskSecret(decrypted),
    apiKey
  };
}

export class AiSettingsRepository {
  async findByUser(userId, includeSecret = false) {
    const rows = await query('SELECT * FROM user_ai_settings WHERE user_id = :userId LIMIT 1', { userId });
    return mapSetting(rows[0], includeSecret);
  }

  async upsert(userId, payload) {
    const encrypted = encryptSecret(payload.apiKey);
    await query(
      `INSERT INTO user_ai_settings (user_id, provider, encrypted_api_key, base_url, model_name, is_enabled)
       VALUES (:userId, :provider, :encrypted, :baseUrl, :modelName, :isEnabled)
       ON DUPLICATE KEY UPDATE provider = VALUES(provider), encrypted_api_key = VALUES(encrypted_api_key),
       base_url = VALUES(base_url), model_name = VALUES(model_name), is_enabled = VALUES(is_enabled)`,
      {
        userId,
        provider: payload.provider,
        encrypted,
        baseUrl: payload.baseUrl,
        modelName: payload.modelName,
        isEnabled: payload.isEnabled ?? true
      }
    );
    return this.findByUser(userId);
  }

  async setEnabled(userId, isEnabled) {
    await query('UPDATE user_ai_settings SET is_enabled = :isEnabled WHERE user_id = :userId', { userId, isEnabled });
    return this.findByUser(userId);
  }

  async remove(userId) {
    await query('DELETE FROM user_ai_settings WHERE user_id = :userId', { userId });
  }

  async logSuggestion({ userId, resumeId, feature, provider, result }) {
    const saved = await query(
      `INSERT INTO ai_suggestions (user_id, resume_id, feature, provider, result)
       VALUES (:userId, :resumeId, :feature, :provider, CAST(:result AS JSON))`,
      { userId, resumeId: resumeId || null, feature, provider, result: JSON.stringify(result) }
    );
    return saved.insertId;
  }
}
