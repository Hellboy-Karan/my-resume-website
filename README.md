# AI Resume Builder by Karan Kumar Sharma

Open-source AI Resume Builder + Portfolio Website platform for creating, editing, analyzing, and sharing resume websites with companies.

The app opens with Karan Kumar Sharma's default resume and supports authenticated resume editing, public resume URLs, ATS analysis, file uploads, role-based access, feature flags, Ollama/local AI, OpenAI-compatible providers, and encrypted per-user API keys.

## Tech Stack

- Frontend: React.js, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Architecture: clean module boundaries with service and repository layers
- Databases: MySQL, MongoDB, Redis
- Auth: JWT, bcrypt password hashing
- Files: Multer upload validation for images and PDFs
- AI: user OpenAI-compatible key, system key, Ollama, mock fallback
- Docker: frontend, backend, MySQL, MongoDB, Redis

## Folder Structure

```text
backend/
  src/
    modules/
      admin/
      ai/
      ats/
      auth/
      public/
      resumes/
      uploads/
      users/
    config/
    database/
    middlewares/
    common/
    utils/
frontend/
  src/
    api/
    components/
    context/
    pages/
```

## Quick Start With Docker

1. Copy the environment file:

```powershell
Copy-Item .env.example .env
```

2. Update `.env` secrets:

```env
JWT_SECRET=replace-with-a-long-random-secret
ENCRYPTION_KEY=replace-with-32-byte-secret-key-here
```

3. Start everything:

```powershell
docker compose up --build
```

4. Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/health`
- Default public resume: `http://localhost:5173/resume/karan-kumar-sharma`

## Local Development

Install backend and frontend dependencies separately:

```powershell
npm --prefix backend install
npm --prefix frontend install
```

Start services with Docker, then run the apps:

```powershell
docker compose up mysql mongodb redis
npm --prefix backend run dev
npm --prefix frontend run dev
```

## Environment Variables

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
ENCRYPTION_KEY=replace-with-32-byte-secret-key-here

MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=ai_resume_builder
MYSQL_USER=resume_user
MYSQL_PASSWORD=resume_password

MONGO_URI=mongodb://mongodb:27017/ai_resume_builder
REDIS_URL=redis://redis:6379

SYSTEM_AI_PROVIDER=ollama
SYSTEM_OPENAI_API_KEY=
SYSTEM_OPENAI_BASE_URL=https://api.openai.com/v1
SYSTEM_OPENAI_MODEL=gpt-4o-mini
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1
```

## Main API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`

Resumes:

- `POST /api/resumes`
- `GET /api/resumes`
- `GET /api/resumes/:id`
- `PUT /api/resumes/:id`
- `DELETE /api/resumes/:id`
- `POST /api/resumes/:resumeId/sections`
- `PUT /api/resumes/:resumeId/sections/:sectionId`
- `DELETE /api/resumes/:resumeId/sections/:sectionId`
- `POST /api/resumes/:resumeId/sections/bulk-delete`

Public:

- `GET /api/public/default-resume`
- `GET /api/public/resume/:username`

ATS and AI:

- `POST /api/ats/analyze`
- `POST /api/ai/improve`
- `GET /api/ai/settings`
- `POST /api/ai/settings`
- `PATCH /api/ai/settings/enabled`
- `DELETE /api/ai/settings`

Uploads:

- `POST /api/uploads`

Admin/Sub Admin:

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `PATCH /api/admin/users/:id/features`
- `GET /api/admin/resumes`

## Roles and Feature Flags

Roles:

- `ADMIN`: system-wide management
- `SUB_ADMIN`: view users/resumes and manage limited user feature flags
- `USER`: own resume creation, editing, uploads, ATS, AI, sharing

Feature flags:

```json
{
  "canEditResume": true,
  "canDeleteResume": true,
  "canSubmitResume": true,
  "canUseATS": true,
  "canUseAI": true,
  "canUploadImage": true,
  "canShareResume": true,
  "canChangeTemplate": true
}
```

## AI Provider Priority

1. User's encrypted OpenAI/OpenAI-compatible API key
2. System OpenAI-compatible API key from `.env`
3. Ollama local model
4. Mock fallback response

User API keys are encrypted on the backend, masked in the UI, and never returned to the frontend.

## Deployment Notes

- Put frontend behind a static host or Nginx.
- Run backend behind HTTPS with a reverse proxy.
- Use managed MySQL, MongoDB, and Redis for production.
- Set strong `JWT_SECRET` and `ENCRYPTION_KEY`.
- Store uploads in S3-compatible storage for production scale.
- Add migrations and seed scripts before multi-environment deployments.