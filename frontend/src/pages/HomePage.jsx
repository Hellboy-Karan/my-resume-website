import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, FileText, LayoutTemplate, Search, Sparkles, Users } from 'lucide-react';
import { api } from '../api/client.js';
import Skeleton from '../components/Skeleton.jsx';
import { templateName } from '../data/templates.js';

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

  useEffect(() => {
    api('/public/dashboard')
      .then(setDashboard)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-coral">AI Resume Builder by Karan Kumar Sharma</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Resume Platform Dashboard</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Create, analyze, edit, and share professional resume websites with companies.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="btn-primary" to="/editor">Create Resume</Link>
          <Link className="btn-secondary" to="/resume-analyzer">Resume Analyzer</Link>
          <Link className="btn-secondary" to="/templates">Browse Templates</Link>
          <Link className="btn-secondary" to="/resume">Public Resumes</Link>
        </div>
      </div>

      {error && <p className="mt-6 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">Unable to load dashboard right now. Please try again.</p>}
      {!dashboard && !error && <div className="mt-8 rounded-md bg-white p-6 shadow-soft"><Skeleton lines={8} /></div>}

      {dashboard && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statsConfig.map(([key, label, Icon]) => (
              <article className="rounded-md border border-slate-200 bg-white p-5 shadow-soft" key={key}>
                <Icon className="text-coral" size={22} />
                <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
                <strong className="mt-1 block text-3xl text-ink">{dashboard.stats[key]}</strong>
              </article>
            ))}
          </div>

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

          <section className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-ink">Resume Showcase</h2>
                <p className="text-slate-600">Published resumes created by Admin users.</p>
              </div>
              <Search className="text-slate-400" />
            </div>
            {!dashboard.resumeShowcase.length ? (
              <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-white p-10 text-center shadow-soft">
                <h3 className="text-xl font-black text-ink">No resumes available</h3>
                <p className="mt-2 text-slate-600">Admin-published resumes will appear here.</p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dashboard.resumeShowcase.map((resume) => (
                  <article className="rounded-md border border-slate-200 bg-white p-5 shadow-soft" key={resume.id}>
                    <h3 className="text-lg font-black text-ink">{resume.title || 'Untitled Resume'}</h3>
                    <p className="mt-1 text-sm text-slate-600">Template: {templateName(resume.template_slug)}</p>
                    <p className="mt-1 text-sm text-slate-500">By {resume.owner_name}</p>
                    <Link className="btn-secondary mt-4" to={`/resume/${resume.owner_username}`}>View Resume</Link>
                  </article>
                ))}
              </div>
            )}
          </section>
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

