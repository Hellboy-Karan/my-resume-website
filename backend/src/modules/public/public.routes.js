import { Router } from 'express';
import { ResumeRepository } from '../resumes/resumes.repository.js';
import { UserRepository } from '../users/users.repository.js';
import { defaultResume } from '../resumes/defaultResume.js';
import { query } from '../../database/mysql.js';

const router = Router();
const resumes = new ResumeRepository();
const users = new UserRepository();

function parseContent(content) {
  if (!content) return {};
  if (typeof content === 'object') return content;
  try {
    return JSON.parse(content);
  } catch (_error) {
    return {};
  }
}

function summaryFromSections(sections) {
  const section = sections.find((item) => ['summary', 'professional-summary'].includes(item.type));
  const content = parseContent(section?.content);
  return content.text || content.body || '';
}

function phoneFromSections(sections) {
  const section = sections.find((item) => ['personal-info', 'personal', 'contact'].includes(item.type));
  const content = parseContent(section?.content);
  return content.phone || content.mobile || content.phoneNumber || '';
}

function linksFromSections(sections) {
  const section = sections.find((item) => ['social-links', 'links'].includes(item.type));
  const content = parseContent(section?.content);
  return Array.isArray(content.items) ? content.items.slice(0, 5) : [];
}

router.get('/default-resume', (_req, res) => {
  res.json(defaultResume);
});

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [userCount] = await query('SELECT COUNT(*) AS total FROM users');
    const [resumeCount] = await query('SELECT COUNT(*) AS total FROM resumes WHERE is_public = TRUE');
    const [templateCount] = await query('SELECT COUNT(*) AS total FROM templates WHERE is_active = TRUE');
    const [analysisCount] = await query('SELECT COUNT(*) AS total FROM ats_reports');
    const recentResumes = await query(
      `SELECT r.id, r.title, r.slug, r.template_slug, r.created_at, r.updated_at, u.name AS owner_name, u.username AS owner_username
       FROM resumes r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.created_at DESC
       LIMIT 5`
    );
    const publishedResumes = await query(
      `SELECT r.id, r.title, r.slug, r.template_slug, r.updated_at, u.name AS owner_name, u.username AS owner_username, u.role AS owner_role
       FROM resumes r
       JOIN users u ON u.id = r.user_id
       WHERE r.is_public = TRUE
       ORDER BY r.updated_at DESC
       LIMIT 5`
    );
    const latestUsers = await query('SELECT id, name, username, role, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    const [mostUsedTemplate] = await query(
      `SELECT template_slug, COUNT(*) AS total
       FROM resumes
       GROUP BY template_slug
       ORDER BY total DESC
       LIMIT 1`
    );
    const adminShowcaseRows = await query(
      `SELECT r.id, r.title, r.slug, r.template_slug, r.profile_image_url, r.updated_at,
        u.name AS owner_name, u.email AS owner_email, u.username AS owner_username,
        u.profile_image_url AS owner_profile_image_url, u.phone AS owner_phone,
        u.short_description AS owner_short_description, u.profile_title AS owner_profile_title,
        u.social_links AS owner_social_links
       FROM resumes r
       JOIN users u ON u.id = r.user_id
       WHERE r.is_public = TRUE AND u.role = 'ADMIN'
       ORDER BY r.updated_at DESC`
    );
    const adminShowcase = await Promise.all(adminShowcaseRows.map(async (resume) => {
      const sections = await resumes.sections(resume.id);
      const ownerLinks = parseContent(resume.owner_social_links);
      return {
        ...resume,
        profile_image_url: resume.profile_image_url || resume.owner_profile_image_url,
        phone: resume.owner_phone || phoneFromSections(sections),
        social_links: Array.isArray(ownerLinks) && ownerLinks.length ? ownerLinks.slice(0, 5) : linksFromSections(sections),
        summary: resume.owner_short_description || summaryFromSections(sections) || resume.title
      };
    }));

    res.json({
      stats: {
        totalUsers: userCount?.total || 0,
        totalPublishedResumes: resumeCount?.total || 0,
        totalTemplates: templateCount?.total || 0,
        totalResumeViews: 0,
        totalResumeAnalyses: analysisCount?.total || 0
      },
      recentActivity: {
        recentlyCreatedResumes: recentResumes,
        recentlyPublishedResumes: publishedResumes,
        latestRegisteredUsers: latestUsers
      },
      analytics: {
        resumeCreationTrend: recentResumes.map((resume) => ({ label: new Date(resume.created_at).toLocaleDateString(), value: 1 })),
        mostUsedTemplate: mostUsedTemplate?.template_slug || 'No template usage yet',
        mostViewedResume: 'Views tracking not enabled yet',
        mostActiveUsers: latestUsers.slice(0, 3)
      },
      resumeShowcase: adminShowcase,
      adminFeaturedResumes: adminShowcase
    });
  } catch (error) {
    next(error);
  }
});

router.get('/resumes', async (_req, res, next) => {
  try {
    const published = await resumes.findPublished();
    res.json({
      resumes: [
        {
          ...defaultResume.resume,
          id: 'default-karan-resume',
          title: defaultResume.resume.title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner: defaultResume.owner
        },
        ...published.map((resume) => ({
          ...resume,
          owner: resume.owner
        }))
      ]
    });
  } catch (error) {
    next(error);
  }
});

router.get('/resume/:username', async (req, res, next) => {
  try {
    const slugResume = await resumes.findBySlug(req.params.username);
    if (slugResume?.is_public) {
      return res.json({
        owner: {
          ...slugResume.owner,
          shortDescription: slugResume.owner?.shortDescription || slugResume.title
        },
        resume: slugResume,
        sections: await resumes.sections(slugResume.id)
      });
    }

    const user = await users.findByUsername(req.params.username);
    if (!user && req.params.username === defaultResume.owner.username) return res.json(defaultResume);
    if (!user) return res.status(404).json({ message: 'Public resume not found' });

    const all = await resumes.findByUser(user.id);
    const resume = all.find((item) => item.is_public);
    if (!resume) return res.status(404).json({ message: 'Public resume not found' });

    res.json({
      owner: {
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImageUrl: user.profile_image_url,
        title: user.profile_title,
        shortDescription: user.short_description || resume.title,
        socialLinks: user.social_links
      },
      resume,
      sections: await resumes.sections(resume.id)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
