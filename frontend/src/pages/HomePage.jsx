import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Eye, FileText, LayoutTemplate, Sparkles, Users } from 'lucide-react';
import { api } from '../api/client.js';
import Skeleton from '../components/Skeleton.jsx';
import { templateName, templates } from '../data/templates.js';
import { richTextToPlain } from '../utils/formatting.js';

const statsConfig = [
  ['totalUsers', 'Total Users', Users],
  ['totalPublishedResumes', 'Published Resumes', FileText],
  ['totalTemplates', 'Templates', LayoutTemplate],
  ['totalResumeViews', 'Resume Views', BarChart3],
  ['totalResumeAnalyses', 'Resume Analyses', Sparkles]
];

export default function HomePage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [featuredPage, setFeaturedPage] = useState(1);

  useEffect(() => {
    api('/public/dashboard')
      .then(setDashboard)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-coral">AI Resume Builder by Karan Kumar Sharma</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Resume Platform Dashboard</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Create, analyze, edit, and share professional resume websites with companies.</p>
        </div>
        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
          <Link className="btn-primary" to="/editor">Create Resume</Link>
          <Link className="btn-secondary" to="/resume-analyzer">Resume Analyzer</Link>
          <Link className="btn-secondary" to="/templates">Browse Templates</Link>
          <Link className="btn-secondary" to="/resume">Public Resumes</Link>
        </div>
      </div>
      </div>

      {error && <p className="mt-6 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">Unable to load dashboard right now. Please try again.</p>}
      {!dashboard && !error && <div className="mt-8 rounded-md bg-white p-6 shadow-soft"><Skeleton lines={8} /></div>}

      {dashboard && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statsConfig.map(([key, label, Icon]) => (
              <article className="rounded-md border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg" key={key}>
                <div className="flex items-center justify-between">
                  <Icon className="text-coral" size={22} />
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">Live</span>
                </div>
                <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
                <strong className="mt-1 block text-3xl text-ink">{key === 'totalTemplates' && !dashboard.stats[key] ? templates.length : dashboard.stats[key] ?? 0}</strong>
              </article>
            ))}
          </div>

          <AdminFeaturedResumes
            resumes={dashboard.adminFeaturedResumes || dashboard.resumeShowcase || []}
            page={featuredPage}
            setPage={setFeaturedPage}
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
            <article className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-xl font-black text-ink">Recent Activity</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <ActivityList title="Recently Created" items={dashboard.recentActivity.recentlyCreatedResumes} />
                <ActivityList title="Recently Published" items={dashboard.recentActivity.recentlyPublishedResumes} />
                <ActivityList title="Latest Users" items={dashboard.recentActivity.latestRegisteredUsers} userList />
              </div>
            </article>

            <article className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-xl font-black text-ink">Analytics</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <Metric label="Most Used Template" value={templateName(dashboard.analytics.mostUsedTemplate)} />
                <Metric label="Most Viewed Resume" value={dashboard.analytics.mostViewedResume} />
                <Metric label="Creation Trend" value={`${dashboard.analytics.resumeCreationTrend.length} recent records`} />
                <Metric label="Most Active Users" value={`${dashboard.analytics.mostActiveUsers.length} active profiles`} />
              </div>
            </article>
          </div>
        </>
      )}
    </section>
  );
}

function AdminFeaturedResumes({ resumes = [], page, setPage }) {
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(resumes.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const visible = resumes.slice((currentPage - 1) * perPage, currentPage * perPage);
  const gridClass = visible.length === 1
    ? 'grid-cols-1'
    : visible.length === 2
      ? 'md:grid-cols-2'
      : 'md:grid-cols-2 xl:grid-cols-3';

  return (
    <section className="mt-8 rounded-md border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-coral">Admin Showcase</p>
          <h2 className="mt-1 text-2xl font-black text-ink">Admin Featured Resumes</h2>
          <p className="mt-1 text-slate-600">Published resumes created by Admin users only.</p>
        </div>
        <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">{resumes.length} featured</span>
      </div>

      {!resumes.length ? (
        <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <h3 className="text-xl font-black text-ink">No Admin published resumes found</h3>
          <p className="mt-2 text-slate-600">Admin resumes will appear here after they are published.</p>
        </div>
      ) : (
        <>
          <div className={`mt-5 grid gap-5 ${gridClass}`}>
            {visible.map((resume) => (
              <article className="group rounded-md border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg" key={resume.id}>
                <div className="flex items-start gap-4">
                  {(resume.profile_image_url || resume.owner_profile_image_url) && (
                    <img className="h-20 w-20 shrink-0 rounded-md object-cover ring-1 ring-slate-200" src={resume.profile_image_url || resume.owner_profile_image_url} alt={`${resume.owner_name} profile`} />
                  )}
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-ink">{resume.owner_name || 'Admin Resume'}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{resume.owner_profile_title || 'Professional Profile'}</p>
                    {resume.owner_email && <p className="mt-1 break-words text-sm text-slate-500">Email: {resume.owner_email}</p>}
                    {(resume.owner_phone || resume.phone) && <p className="mt-1 text-sm text-slate-500">Phone: {resume.owner_phone || resume.phone}</p>}
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {richTextToPlain(resume.owner_short_description || resume.summary || resume.title || 'Professional resume website with published profile, skills, projects, and experience details.')}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(resume.social_links || []).slice(0, 5).map((link, index) => {
                    const item = typeof link === 'string' ? { label: 'Link', url: link } : link;
                    if (!item?.url) return null;
                    return (
                      <a className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 hover:text-coral" href={item.url} target={item.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer" key={`${resume.id}-${item.url}-${index}`}>
                        {item.label || 'Profile'}
                      </a>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">Template: {templateName(resume.template_slug)}</span>
                  <Link className="btn-primary" to={`/resume/${resume.slug}`}>
                    <Eye size={16} /> View
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-sm font-semibold text-slate-500">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button className="btn-secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
                <button className="btn-secondary" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ActivityList({ title, items = [], userList = false }) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <h3 className="font-black text-ink">{title}</h3>
      {!items.length ? <p className="mt-2 text-sm text-slate-500">No activity yet.</p> : (
        <ul className="mt-3 grid gap-2">
          {items.map((item) => (
            <li className="text-sm text-slate-600" key={`${title}-${item.id}`}>
              <strong className="block text-ink">{userList ? item.name : item.title || 'Untitled Resume'}</strong>
              <span>{userList ? item.role : item.owner_name || item.owner_username}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <p className="font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-black text-ink">{value}</p>
    </div>
  );
}
