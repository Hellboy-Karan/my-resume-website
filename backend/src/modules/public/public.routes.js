import { Router } from 'express';
import { ResumeRepository } from '../resumes/resumes.repository.js';
import { UserRepository } from '../users/users.repository.js';
import { defaultResume } from '../resumes/defaultResume.js';
import { query } from '../../database/mysql.js';

const router = Router();
const resumes = new ResumeRepository();
const users = new UserRepository();

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
    const adminShowcase = await query(
      `SELECT r.id, r.title, r.slug, r.template_slug, r.updated_at, u.name AS owner_name, u.username AS owner_username
       FROM resumes r
       JOIN users u ON u.id = r.user_id
       WHERE r.is_public = TRUE AND u.role = 'ADMIN'
       ORDER BY r.updated_at DESC
       LIMIT 6`
    );

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
      resumeShowcase: adminShowcase
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
        owner: {
          name: resume.owner_name,
          username: resume.owner_username,
          email: resume.owner_email
        }
        }))
      ]
    });
  } catch (error) {
    next(error);
  }
});

router.get('/resume/:username', async (req, res, next) => {
  try {
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
        title: resume.title
      },
      resume,
      sections: await resumes.sections(resume.id)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
