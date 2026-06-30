import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { api } from '../api/client.js';
import AdminResumeUsersPanel from '../components/AdminResumeUsersPanel.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
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
  const [selectedIds, setSelectedIds] = useState([]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = user ? await api('/resumes') : await api('/public/resumes');
      setResumes(data.resumes || []);
      setSelectedIds([]);
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

  async function bulkDelete() {
    setBusy('bulk-delete');
    setError('');
    try {
      const result = await api('/resumes/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ resumeIds: selectedIds })
      });
      setResumes(resumes.filter((resume) => !result.deletedIds.includes(Number(resume.id))));
      setSelectedIds([]);
      if (result.blocked?.length) {
        setError(`${result.blocked.length} selected resume(s) were protected and not deleted.`);
      }
    } catch (err) {
      setError(err.message || 'Unable to bulk delete selected resumes.');
    } finally {
      setBusy('');
    }
  }

  function canManage(resume) {
    const ownerRole = resume.owner?.role;
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'SUB_ADMIN') return ownerRole !== 'ADMIN';
    return resume.user_id === user.id;
  }

  const visibleResumes = resumes.filter((resume) => {
    const haystack = `${resume.title || ''} ${resume.owner?.name || ''} ${resume.template_slug || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'published' ? resume.is_public : !resume.is_public);
    return matchesSearch && matchesFilter;
  });
  const canSeeAdminPanel = user && ['ADMIN', 'SUB_ADMIN'].includes(user.role);
  const canCreateResume = user && user.role !== 'USER';
  const selectableResumes = visibleResumes.filter(canManage);
  const allSelected = selectableResumes.length > 0 && selectableResumes.every((resume) => selectedIds.includes(Number(resume.id)));

  function toggleResume(id) {
    const numericId = Number(id);
    setSelectedIds((current) => current.includes(numericId) ? current.filter((item) => item !== numericId) : [...current, numericId]);
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : selectableResumes.map((resume) => Number(resume.id)));
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-ink">Resumes</h1>
          <p className="text-slate-600">{user ? 'Manage your resume websites.' : 'Browse published resume websites in view mode.'}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={load}><RefreshCw size={16} /> Update</button>
          {canCreateResume && <button className="btn-primary" onClick={createResume} disabled={busy === 'create'}><Plus size={18} /> {busy === 'create' ? 'Creating...' : 'New Resume'}</button>}
        </div>
      </div>

      {error && <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
      {loading && <div className="mt-6 rounded-md border border-slate-200 bg-white p-6"><Skeleton lines={6} /></div>}

      {canSeeAdminPanel && <AdminResumeUsersPanel currentUser={user} />}

      <div className="mt-6 rounded-md border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-3">
          <h2 className="text-lg font-black text-ink">Find Resumes</h2>
          <p className="text-sm text-slate-600">Search by resume title, owner name, or selected template.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input className="input h-12 pl-12 pr-4" placeholder="Search by title, owner, or template" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <select className="input h-12" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All visibility</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {user && selectableResumes.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-soft">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
            Select all manageable resumes
          </label>
          <button className="btn-secondary" onClick={bulkDelete} disabled={!selectedIds.length || busy === 'bulk-delete'}>
            <Trash2 size={16} /> {busy === 'bulk-delete' ? 'Deleting...' : `Bulk Delete (${selectedIds.length})`}
          </button>
        </div>
      )}

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
          const publicHandle = resume.slug || resume.owner?.username || user?.username;
          return (
            <article className="rounded-md border border-slate-200 bg-white p-5 shadow-soft" key={resume.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {canManage(resume) && <input className="mt-1" type="checkbox" checked={selectedIds.includes(Number(resume.id))} onChange={() => toggleResume(resume.id)} />}
                  {resume.profile_image_url && (
                    <img className="h-16 w-16 shrink-0 rounded-md object-cover ring-1 ring-slate-200" src={resume.profile_image_url} alt={`${resume.owner?.name || resume.title || 'Resume'} profile`} />
                  )}
                  <div>
                  <h2 className="text-xl font-black text-ink">{resume.title || 'Untitled Resume'}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-600">Template: {templateName(resume.template_slug)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span>Owner: <strong className="text-ink">{resume.owner?.name || user?.name || 'Public user'}</strong></span>
                    <RoleBadge role={resume.owner?.role || user?.role || 'USER'} />
                  </div>
                  </div>
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
                <Link className="btn-secondary" to={`/resume/${publicHandle}`}><Eye size={16} /> View</Link>
                {canManage(resume) && (
                  <>
                    <Link className="btn-primary" to={`/editor?resumeId=${resume.id}`}><Pencil size={16} /> Edit</Link>
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
