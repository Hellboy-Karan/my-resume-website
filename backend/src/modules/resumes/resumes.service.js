import { HttpError, assertFound } from '../../common/httpError.js';
import { slugify } from '../../utils/slug.js';
import { ResumeRepository } from './resumes.repository.js';

export class ResumeService {
  constructor(repository = new ResumeRepository()) {
    this.repository = repository;
  }

  async ensureOwnerOrAdmin(user, resumeId) {
    const resume = assertFound(await this.repository.findById(resumeId), 'Resume not found');
    return this.ensureCanManageResume(user, resume, 'update');
  }

  ensureCanManageResume(user, resume, action = 'view') {
    const ownerRole = resume.owner?.role;
    const isOwner = resume.user_id === user.id;
    if (user.role === 'ADMIN') return resume;
    if (user.role === 'SUB_ADMIN') {
      if (ownerRole === 'ADMIN' && !isOwner) {
        throw new HttpError(403, 'Sub Admin cannot manage Admin resumes');
      }
      return resume;
    }
    if (isOwner) return resume;
    throw new HttpError(403, `You cannot ${action} this resume`);
  }

  async create(user, payload) {
    const slug = `${user.username}-${Date.now().toString(36)}`;
    return this.repository.create({
      userId: user.id,
      title: payload.title || 'Untitled Resume',
      slug,
      templateSlug: payload.templateSlug || 'modern-developer'
    });
  }

  async listMine(user) {
    if (user.role === 'ADMIN' || user.role === 'SUB_ADMIN') {
      return this.repository.findAll();
    }
    return this.repository.findByUser(user.id);
  }

  async get(user, id) {
    const resume = await this.ensureOwnerOrAdmin(user, Number(id));
    const sections = await this.repository.sections(resume.id);
    return { resume, sections };
  }

  async update(user, id, payload) {
    await this.ensureOwnerOrAdmin(user, Number(id));
    return this.repository.update(Number(id), payload);
  }

  async delete(user, id) {
    const resume = assertFound(await this.repository.findById(Number(id)), 'Resume not found');
    this.ensureCanManageResume(user, resume, 'delete');
    if (user.role === 'SUB_ADMIN' && resume.owner?.role === 'ADMIN') {
      throw new HttpError(403, 'Sub Admin cannot delete Admin resumes');
    }
    await this.repository.delete(Number(id));
  }

  async bulkDelete(user, ids) {
    const allowedIds = [];
    const blocked = [];
    for (const id of ids.map(Number)) {
      const resume = await this.repository.findById(id);
      if (!resume) {
        blocked.push({ id, reason: 'Resume not found' });
        continue;
      }
      try {
        this.ensureCanManageResume(user, resume, 'delete');
        if (user.role === 'SUB_ADMIN' && resume.owner?.role === 'ADMIN') {
          throw new HttpError(403, 'Sub Admin cannot delete Admin resumes');
        }
        allowedIds.push(id);
      } catch (error) {
        blocked.push({ id, reason: error.message });
      }
    }
    if (!allowedIds.length) throw new HttpError(403, 'No selected resumes can be deleted', blocked);
    await this.repository.bulkDelete(allowedIds);
    return { deletedIds: allowedIds, blocked };
  }

  async addSection(user, resumeId, payload) {
    await this.ensureOwnerOrAdmin(user, Number(resumeId));
    return this.repository.addSection({
      resumeId: Number(resumeId),
      type: slugify(payload.type || payload.title || 'custom'),
      title: payload.title,
      content: payload.content || {},
      sortOrder: Number(payload.sortOrder || 0)
    });
  }

  async updateSection(user, resumeId, sectionId, payload) {
    await this.ensureOwnerOrAdmin(user, Number(resumeId));
    const section = assertFound(await this.repository.findSectionById(Number(sectionId)), 'Section not found');
    if (section.resume_id !== Number(resumeId)) throw new HttpError(404, 'Section not found in this resume');
    return this.repository.updateSection(Number(sectionId), payload);
  }

  async deleteSection(user, resumeId, sectionId) {
    await this.ensureOwnerOrAdmin(user, Number(resumeId));
    await this.repository.deleteSection(Number(sectionId));
  }

  async bulkDeleteSections(user, resumeId, sectionIds) {
    await this.ensureOwnerOrAdmin(user, Number(resumeId));
    await this.repository.bulkDeleteSections(sectionIds.map(Number), Number(resumeId));
  }

  async importExtractedData(user, resumeId, extracted) {
    await this.ensureOwnerOrAdmin(user, Number(resumeId));
    const additions = [
      ['personal-info', 'Personal Info', extracted.personalInfo],
      ['summary', 'Professional Summary', { text: extracted.summary }],
      ['experience', 'Experience', { text: extracted.experience }],
      ['education', 'Education', { text: extracted.education }],
      ['skills', 'Skills', { items: extracted.skills || [] }],
      ['projects', 'Projects', { text: extracted.projects }],
      ['certifications', 'Certifications', { text: extracted.certifications }],
      ['languages', 'Languages', { text: extracted.languages }],
      ['achievements', 'Achievements', { text: extracted.achievements }],
      ['links', 'Links', { items: extracted.links || [] }]
    ].filter(([, , content]) => {
      if (!content) return false;
      if (Array.isArray(content.items)) return content.items.length > 0;
      return Object.values(content).some(Boolean);
    });

    const created = [];
    for (const [type, title, content] of additions) {
      created.push(await this.repository.addSection({
        resumeId: Number(resumeId),
        type,
        title,
        content,
        sortOrder: created.length + 1
      }));
    }

    if (!created.length && extracted.rawText) {
      created.push(await this.repository.addSection({
        resumeId: Number(resumeId),
        type: 'custom-import',
        title: 'Imported Resume Content',
        content: { text: extracted.rawText },
        sortOrder: 1
      }));
    }

    return created;
  }
}
