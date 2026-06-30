import { Router } from 'express';
import { ResumeRepository } from '../resumes/resumes.repository.js';
import { UserRepository } from '../users/users.repository.js';
import { defaultResume } from '../resumes/defaultResume.js';

const router = Router();
const resumes = new ResumeRepository();
const users = new UserRepository();

router.get('/default-resume', (_req, res) => {
  res.json(defaultResume);
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
