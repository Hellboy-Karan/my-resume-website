import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { api } from '../api/client.js';
import Skeleton from '../components/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { templateName } from '../data/templates.js';

export default function ResumeDashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = user ? await api('/resumes') : await api('/public/resumes');
      setResumes(data.resumes || []);
    } catch (err) {
      setError('Unable to load resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user]);

  async function createResume() {
    setBusy('create');
    try {
      const data = await api('/resumes', { method: 'POST', body: JSON.stringify({ title: 'Untitled Resume' }) });
      setResumes([data.resume, ...resumes]);
    } catch (err) {
      setError('Unable to create resume. Please try again.');
    } finally {
      setBusy('');
    }
  }

  async function deleteResume(id) {
    setBusy(`delete-${id}`);
    try {
      await api(`/resumes/${id}`, { method: 'DELETE' });
      setResumes(resumes.filter((resume) => resume.id !== id));
    } catch (err) {
      setError('Unable to delete resume. Please try again.');
    } finally {
      setBusy('');
    }
  }

  function canManage(resume) {
    return user && (user.role === 'ADMIN' || resume.user_id === user.id);
  }

  const visibleResumes = resumes.filter((resume) => {
    const haystack = `${resume.title || ''} ${resume.owner?.name || ''} ${resume.template_slug || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'published' ? resume.is_public : !resume.is_public);
    return matchesSearch && matchesFilter;
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-ink">Resumes</h1>
          <p className="text-slate-600">{user ? 'Manage your resume websites.' : 'Browse published resume websites in view mode.'}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={load}><RefreshCw size={16} /> Update</button>
          {user && <button className="btn-primary" onClick={createResume} disabled={busy === 'create'}><Plus size={18} /> {busy === 'create' ? 'Creating...' : 'New Resume'}</button>}
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-[1fr_220px]">
        <label className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search by title, owner, or template" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <select className="input" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All visibility</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {error && <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
      {loading && <div className="mt-6 rounded-md border border-slate-200 bg-white p-6"><Skeleton lines={6} /></div>}

      {!loading && !visibleResumes.length && (
        <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-white p-10 text-center shadow-soft">
          <FileTextIcon />
          <h2 className="mt-4 text-2xl font-black text-ink">No resumes available</h2>
          <p className="mt-2 text-slate-600">{user ? 'Create your first resume or change your search filters.' : 'No published resumes found.'}</p>
          {user && <button className="btn-primary mt-5" onClick={createResume}>Create your first resume</button>}
        </div>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {visibleResumes.map((resume) => {
          const ownerUsername = resume.owner?.username || user?.username;
          return (
            <article className="rounded-md border border-slate-200 bg-white p-5 shadow-soft" key={resume.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-ink">{resume.title || 'Untitled Resume'}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-600">Template: {templateName(resume.template_slug)}</p>
                  <p className="mt-1 text-sm text-slate-500">Owner: {resume.owner?.name || user?.name || 'Public user'}</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs font-black ${resume.is_public ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {resume.is_public ? 'Published' : 'Draft'}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <div><dt className="font-bold text-slate-500">Created</dt><dd>{formatDate(resume.created_at)}</dd></div>
                <div><dt className="font-bold text-slate-500">Updated</dt><dd>{formatDate(resume.updated_at)}</dd></div>
                <div><dt className="font-bold text-slate-500">Visibility</dt><dd>{resume.is_public ? 'Public' : 'Private'}</dd></div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link className="btn-secondary" to={`/resume/${ownerUsername}`}><Eye size={16} /> View</Link>
                {canManage(resume) && (
                  <>
                    <Link className="btn-primary" to="/editor"><Pencil size={16} /> Edit</Link>
                    <button className="btn-secondary" onClick={load}><RefreshCw size={16} /> Update</button>
                    <button className="btn-secondary" onClick={() => deleteResume(resume.id)} disabled={busy === `delete-${resume.id}`}><Trash2 size={16} /> Delete</button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FileTextIcon() {
  return <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-slate-100 text-slate-500"><Eye size={22} /></div>;
}

function formatDate(value) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString();
}
