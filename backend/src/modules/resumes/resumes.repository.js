import { query } from '../../database/mysql.js';
import { ResumeContent } from '../../database/mongo.js';

function parseSection(row) {
  if (!row) return null;
  return {
    ...row,
    content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
    is_visible: Boolean(row.is_visible)
  };
}

function parseResume(row) {
  if (!row) return null;
  const resume = {
    ...row,
    is_public: Boolean(row.is_public),
    watermark_enabled: Boolean(row.watermark_enabled)
  };
  if (row.owner_name || row.owner_username || row.owner_role || row.owner_email) {
    resume.owner = {
      name: row.owner_name,
      username: row.owner_username,
      email: row.owner_email,
      role: row.owner_role,
      phone: row.owner_phone,
      profileImageUrl: row.owner_profile_image_url,
      shortDescription: row.owner_short_description,
      title: row.owner_profile_title,
      address: row.owner_address,
      city: row.owner_city,
      state: row.owner_state,
      country: row.owner_country,
      postalCode: row.owner_postal_code,
      aboutMe: row.owner_about_me,
      socialLinks: typeof row.owner_social_links === 'string' ? JSON.parse(row.owner_social_links || '[]') : row.owner_social_links
    };
  }
  return resume;
}

const ownerSelect = `u.name AS owner_name, u.username AS owner_username, u.email AS owner_email, u.role AS owner_role,
  u.phone AS owner_phone, u.profile_image_url AS owner_profile_image_url, u.short_description AS owner_short_description,
  u.profile_title AS owner_profile_title, u.address AS owner_address, u.city AS owner_city, u.state AS owner_state,
  u.country AS owner_country, u.postal_code AS owner_postal_code, u.about_me AS owner_about_me, u.social_links AS owner_social_links`;

export class ResumeRepository {
  async create({ userId, title, slug, templateSlug = 'modern-developer' }) {
    const result = await query(
      `INSERT INTO resumes (user_id, title, slug, template_slug)
       VALUES (:userId, :title, :slug, :templateSlug)`,
      { userId, title, slug, templateSlug }
    );
    await ResumeContent.create({ resumeId: result.insertId, userId, content: {} });
    return this.findById(result.insertId);
  }

  async findById(id) {
    const rows = await query(
      `SELECT r.*, ${ownerSelect}
       FROM resumes r
       JOIN users u ON u.id = r.user_id
       WHERE r.id = :id
       LIMIT 1`,
      { id }
    );
    return parseResume(rows[0]);
  }

  async findBySlug(slug) {
    const rows = await query(
      `SELECT r.*, ${ownerSelect}
       FROM resumes r
       JOIN users u ON u.id = r.user_id
       WHERE r.slug = :slug
       LIMIT 1`,
      { slug }
    );
    return parseResume(rows[0]);
  }

  async findByUser(userId) {
    const rows = await query(
      `SELECT r.*, ${ownerSelect}
       FROM resumes r
       JOIN users u ON u.id = r.user_id
       WHERE r.user_id = :userId
       ORDER BY r.updated_at DESC`,
      { userId }
    );
    return rows.map(parseResume);
  }

  async findAll() {
    const rows = await query(
      `SELECT r.*, ${ownerSelect}
       FROM resumes r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.updated_at DESC`
    );
    return rows.map(parseResume);
  }

  async findPublished() {
    const rows = await query(
      `SELECT r.*, ${ownerSelect}
       FROM resumes r
       JOIN users u ON u.id = r.user_id
       WHERE r.is_public = TRUE
       ORDER BY r.updated_at DESC`
    );
    return rows.map(parseResume);
  }

  async update(id, data) {
    const allowed = {
      title: 'title',
      templateSlug: 'template_slug',
      isPublic: 'is_public',
      watermarkEnabled: 'watermark_enabled',
      profileImageUrl: 'profile_image_url'
    };
    const fields = [];
    const params = { id };
    for (const [key, value] of Object.entries(data)) {
      if (allowed[key]) {
        fields.push(`${allowed[key]} = :${key}`);
        params[key] = value;
      }
    }
    if (fields.length) await query(`UPDATE resumes SET ${fields.join(', ')} WHERE id = :id`, params);
    return this.findById(id);
  }

  async incrementViewCount(id) {
    await query('UPDATE resumes SET view_count = view_count + 1 WHERE id = :id', { id });
    return this.findById(id);
  }

  async delete(id) {
    await query('DELETE FROM resumes WHERE id = :id', { id });
  }

  async bulkDelete(ids) {
    if (!ids.length) return;
    await query(
      `DELETE FROM resumes WHERE id IN (${ids.map((_, index) => `:id${index}`).join(',')})`,
      ids.reduce((params, id, index) => ({ ...params, [`id${index}`]: id }), {})
    );
  }

  async addSection({ resumeId, type, title, content, sortOrder = 0 }) {
    const result = await query(
      `INSERT INTO resume_sections (resume_id, type, title, content, sort_order)
       VALUES (:resumeId, :type, :title, CAST(:content AS JSON), :sortOrder)`,
      { resumeId, type, title, content: JSON.stringify(content), sortOrder }
    );
    return this.findSectionById(result.insertId);
  }

  async findSectionById(id) {
    const rows = await query('SELECT * FROM resume_sections WHERE id = :id LIMIT 1', { id });
    return parseSection(rows[0]);
  }

  async sections(resumeId) {
    const rows = await query(
      'SELECT * FROM resume_sections WHERE resume_id = :resumeId ORDER BY sort_order ASC, id ASC',
      { resumeId }
    );
    return rows.map(parseSection);
  }

  async updateSection(id, data) {
    const allowed = { type: 'type', title: 'title', content: 'content', sortOrder: 'sort_order', isVisible: 'is_visible' };
    const fields = [];
    const params = { id };
    for (const [key, value] of Object.entries(data)) {
      if (allowed[key]) {
        fields.push(`${allowed[key]} = :${key}`);
        params[key] = key === 'content' ? JSON.stringify(value) : value;
      }
    }
    if (fields.length) await query(`UPDATE resume_sections SET ${fields.join(', ')} WHERE id = :id`, params);
    return this.findSectionById(id);
  }

  async deleteSection(id) {
    await query('DELETE FROM resume_sections WHERE id = :id', { id });
  }

  async bulkDeleteSections(ids, resumeId) {
    if (!ids.length) return;
    await query(
      `DELETE FROM resume_sections WHERE resume_id = :resumeId AND id IN (${ids.map((_, index) => `:id${index}`).join(',')})`,
      ids.reduce((params, id, index) => ({ ...params, [`id${index}`]: id }), { resumeId })
    );
  }
}
