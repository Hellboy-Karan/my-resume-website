# AI Resume by Karan Kumar Sharma

Open-source AI Resume + Portfolio Website platform for creating, editing, analyzing, importing, arranging, and sharing resume websites with companies.

The platform supports public resume links, rich text resume sections, multiple templates, profile settings, role-based permissions, user resume management, Resume Analyzer, local/Ollama AI, OpenAI-compatible AI providers, encrypted per-user API keys, uploads, Dockerized services, and public resume view tracking.

## Current Highlights

- Public resume website URLs: `http://localhost:5173/resume/:slug`
- Full public URL display inside resume editor and resume view
- Resume menu visible to guests and logged-in users
- Public resumes readable by guests
- Edit/update/delete buttons hidden when user is not allowed
- Admin/Sub Admin user resume management
- Admin role and permission management
- Dynamic feature flags and custom permissions
- Rich text editor for resume content
- Sanitized rich HTML rendering on preview/public/PDF print
- Drag-and-drop section ordering with saved `sort_order`
- Profile image upload, replace, remove
- PDF/DOCX resume import
- Print as PDF while preserving selected template design
- Resume view counts per resume
- Resume analysis counts on dashboard
- Forgot password OTP flow with SMTP support
- Light, dark, and system theme mode
- Shared TypeScript type foundation in `shared/types.ts`

## Tech Stack

- Frontend: React.js, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Architecture: module-based clean structure with service and repository layers
- Databases: MySQL, MongoDB, Redis
- Auth: JWT, bcrypt password hashing
- Uploads: Multer with file validation
- Rich text: contentEditable editor + backend/frontend sanitization
- AI: user OpenAI-compatible key, system OpenAI-compatible key, Ollama, mock fallback
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
    common/
    config/
    database/
    middlewares/
    utils/
frontend/
  src/
    api/
    components/
    context/
    data/
    pages/
    utils/
shared/
  types.ts
```

## Quick Start With Docker

1. Copy environment variables:

```powershell
Copy-Item .env.example .env
```

2. Update important secrets in `.env`:

```env
JWT_SECRET=replace-with-a-long-random-secret
ENCRYPTION_KEY=replace-with-32-byte-secret-key-here
```

3. Start the app:

```powershell
docker compose up -d --build
```

4. Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/health`
- Public resume list: `http://localhost:5173/resume`
- Public resume URL format: `http://localhost:5173/resume/:slug`

## Local Development

Install dependencies:

```powershell
npm --prefix backend install
npm --prefix frontend install
```

Run databases in Docker:

```powershell
docker compose up -d mysql mongodb redis
```

Run backend and frontend locally:

```powershell
npm --prefix backend run dev
npm --prefix frontend run dev
```

## Environment Variables

```env
APP_NAME="AI Resume by Karan Kumar Sharma"
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=replace-with-32-byte-secret-key-here

MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=ai_resume
MYSQL_USER=resume_user
MYSQL_PASSWORD=resume_password

MONGO_URI=mongodb://mongodb:27017/ai_resume
REDIS_URL=redis://redis:6379

UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5

SYSTEM_AI_PROVIDER=ollama
SYSTEM_OPENAI_API_KEY=
SYSTEM_OPENAI_BASE_URL=https://api.openai.com/v1
SYSTEM_OPENAI_MODEL=gpt-4o-mini
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM="AI Resume <your-gmail@gmail.com>"

VITE_API_URL=http://localhost:5000/api
VITE_PUBLIC_URL=http://localhost:5173
```

## Default Admin Rule

The email below is protected as the default Admin:

```text
sk5485633@gmail.com
```

If a user registers with this email, the account is automatically assigned the `ADMIN` role. This email cannot be downgraded from Admin through role management.

## Roles

- `ADMIN`: manage users, roles, permissions, resumes, templates, visibility, and moderation actions.
- `SUB_ADMIN`: moderate users/resumes only when permissions allow; cannot manage Admin accounts or Admin resumes.
- `USER`: manage only own profile/resume when allowed by permissions.

## Permissions And Feature Flags

Admin can assign permissions/feature flags to Users and Sub Admins.

Common permissions:

```json
{
  "canCreateResume": true,
  "canEditOwnResume": true,
  "canPublishResume": true,
  "canDeleteOwnResume": true,
  "canViewAllResumes": false,
  "canModerateResumes": false,
  "canManageTemplates": false,
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

Permissions are applied on both frontend button visibility and backend route protection.

## Main Features

### Resume

- Create resume
- Edit resume sections
- Add custom sections
- Bulk delete sections
- Drag sections to arrange order
- Save section order in MySQL
- Live preview using selected template
- Switch template anytime
- Upload profile image
- Import PDF/DOCX resume
- Add social/profile links
- Print selected template as PDF

### Rich Text Resume Content

Rich text is supported for:

- Professional Summary
- Experience
- Projects
- Education
- Certifications
- Achievements
- Custom Sections
- About Me
- Resume Short Description

Formatting supports:

- New lines
- Paragraphs
- Bullet lists
- Numbered lists
- Bold
- Italic
- Underline
- Links

The backend sanitizes submitted rich text before storage. The frontend sanitizes again before rendering with `dangerouslySetInnerHTML`.

### Profile Settings

Route:

```text
/settings
```

Users can update only their own profile:

- Full Name
- Profile Image
- Phone Number
- Address, City, State, Country, Postal Code
- About Me
- Resume Short Description
- Current Job Role/Profile Title
- Skills, Education, Experience, Projects
- Certificates
- Achievements, Languages, Awards, Interests
- Custom professional sections
- Social/Profile Links

Email is displayed as read-only.

### Templates

Available resume template styles include:

- Modern Developer
- ATS Friendly
- Minimal
- Sidebar
- Portfolio
- Creative
- Corporate
- Standard Template
- Product Company
- Senior Product Engineer
- Management Executive
- Operations Manager
- Consulting Leadership

Template preview images use placeholders when a real image is missing.

### Resume Analyzer

The Resume Analyzer works for guests and logged-in users:

- PDF resume upload and text extraction
- Paste resume text
- Paste job description
- Score out of 10
- Missing skills
- Missing keywords
- Matching skills
- Formatting issues
- Grammar issues
- Improvement suggestions

Successful analysis increments dashboard analysis metrics.

### AI Features

AI provider priority:

1. User's encrypted OpenAI/OpenAI-compatible API key
2. System OpenAI-compatible API key from `.env`
3. Ollama local model
4. Mock fallback response

Supported AI actions:

- Improve summary
- Improve bullet points
- Suggest project descriptions
- Suggest ATS keywords
- Rewrite weak sentences
- Generate professional resume text
- Suggest missing skills

User API keys are encrypted on the backend, masked in the UI, and never exposed to the frontend.

### Forgot Password

Flow:

1. User enters email.
2. Backend generates OTP.
3. If SMTP is configured, OTP is sent to email.
4. User verifies OTP.
5. User sets new password and confirm password.
6. User is redirected to login.

For Gmail, use a Gmail App Password, not the normal Gmail account password.

### Dashboard

Dashboard includes:

- Total Users
- Total Published Resumes
- Total Templates
- Total Resume Views
- Total Resume Analyzer Reports
- Recent activity
- Analytics
- Admin Featured Resumes

Admin Featured Resumes only shows published resumes created by Admin users.

### Resume Menu

The Resume menu shows published resumes to guests and logged-in users.

Cards include:

- Owner name
- Owner role badge
- Template name
- Created/updated dates
- Visibility/status
- Resume view count
- View button for everyone
- Edit/update/delete only when allowed

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password/request`
- `POST /api/auth/forgot-password/verify`
- `POST /api/auth/forgot-password/reset`

### Users

- `GET /api/users/me`
- `GET /api/users/settings`
- `PUT /api/users/settings`
- `PATCH /api/users/theme`

### Resumes

- `GET /api/resumes`
- `POST /api/resumes`
- `GET /api/resumes/:id`
- `PUT /api/resumes/:id`
- `DELETE /api/resumes/:id`
- `POST /api/resumes/bulk-delete`
- `PATCH /api/resumes/:id/profile-image`
- `POST /api/resumes/:id/import`

### Resume Sections

- `POST /api/resumes/:resumeId/sections`
- `PUT /api/resumes/:resumeId/sections/:sectionId`
- `DELETE /api/resumes/:resumeId/sections/:sectionId`
- `POST /api/resumes/:resumeId/sections/bulk-delete`
- `POST /api/resumes/:resumeId/sections/reorder`

### Public

- `GET /api/public/default-resume`
- `GET /api/public/dashboard`
- `GET /api/public/resumes`
- `GET /api/public/resume/:username`

### Resume Analyzer And AI

- `POST /api/ats/analyze`
- `POST /api/ai/improve`
- `GET /api/ai/settings`
- `POST /api/ai/settings`
- `PATCH /api/ai/settings/enabled`
- `DELETE /api/ai/settings`

### Uploads

- `POST /api/uploads`

### Admin/Sub Admin

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `PATCH /api/admin/users/:id/role`
- `PATCH /api/admin/users/:id/features`
- `PATCH /api/admin/users/:id/permissions`
- `GET /api/admin/resumes`
- `GET /api/admin/resume-users`
- `GET /api/admin/users/:id/resumes`
- `PATCH /api/admin/resumes/:id/visibility`
- `DELETE /api/admin/resumes/:id`
- `GET /api/admin/templates`
- `POST /api/admin/templates`

## Database Overview

MySQL stores structured app data:

- `users`
- `resumes`
- `resume_sections`
- `templates`
- `uploaded_files`
- `ats_reports`
- `ai_suggestions`
- `user_ai_settings`
- `app_counters`

MongoDB stores flexible resume/AI content where needed.

Redis is used for caching/session/rate-limit friendly infrastructure.

## Reset Database For Fresh Testing

This removes local Docker volumes and all database data:

```powershell
docker compose down -v
docker compose up -d --build
```

Redis only:

```powershell
docker compose exec redis redis-cli FLUSHALL
```

MySQL is exposed locally on port `3307`, MongoDB on `27018`, and Redis on `6380`.

## Useful Docker Commands

```powershell
docker compose up -d --build backend frontend
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
docker ps
```

## Validation Commands

Frontend build:

```powershell
npm --prefix frontend run build
```

Backend syntax checks:

```powershell
node --check backend/src/modules/resumes/resumes.routes.js
node --check backend/src/modules/resumes/resumes.service.js
node --check backend/src/modules/resumes/resumes.repository.js
```

## Deployment Notes

- Deploy frontend as static files behind Nginx or a static hosting provider.
- Deploy backend behind HTTPS and a reverse proxy.
- Use managed MySQL, MongoDB, and Redis for production.
- Set strong `JWT_SECRET` and `ENCRYPTION_KEY`.
- Configure SMTP for real password reset emails.
- Configure `FRONTEND_URL`, `VITE_API_URL`, and `VITE_PUBLIC_URL` for the deployed domain.
- Move uploads to S3-compatible storage for production scale.
- Add formal migrations before running multiple production environments.

