import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ImagePlus, KeyRound, Plus, Save, Trash2 } from 'lucide-react';
import { API_URL, api } from '../api/client.js';
import Modal from '../components/Modal.jsx';
import ResumeView from '../components/ResumeView.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const templates = ['modern-developer', 'ats-friendly', 'minimal', 'sidebar', 'portfolio'];

export default function ResumeEditorPage() {
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const [aiModal, setAiModal] = useState(false);
  const [apiModal, setApiModal] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState('');

  const data = useMemo(() => ({
    owner: user ? { name: user.name, username: user.username, email: user.email, title: resume?.title } : {},
    resume: resume || {},
    sections
  }), [user, resume, sections]);

  useEffect(() => {
    if (!user) return;
    api('/resumes')
      .then(async (data) => {
        const first = data.resumes[0] || (await api('/resumes', { method: 'POST', body: JSON.stringify({ title: `${user.name} Resume` }) })).resume;
        const full = await api(`/resumes/${first.id}`);
        setResume(full.resume);
        setSections(full.sections);
      });
  }, [user]);

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black text-ink">Resume Editor</h1>
        <p className="mt-3 text-slate-600">Login to unlock edit buttons, custom sections, uploads, ATS, and AI suggestions.</p>
        <Link className="btn-primary mt-6" to="/login">Login to edit</Link>
      </section>
    );
  }

  function toggleSelect(id) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function saveResumePatch(patch) {
    const data = await api(`/resumes/${resume.id}`, { method: 'PUT', body: JSON.stringify(patch) });
    setResume(data.resume);
  }

  async function saveSection(event) {
    event.preventDefault();
    const payload = {
      title: editing.title,
      type: editing.type || 'custom',
      content: parseSectionContent(editing.contentText),
      sortOrder: editing.sort_order || 0
    };
    if (editing.id) {
      const data = await api(`/resumes/${resume.id}/sections/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setSections(sections.map((section) => section.id === data.section.id ? data.section : section));
    } else {
      const data = await api(`/resumes/${resume.id}/sections`, { method: 'POST', body: JSON.stringify(payload) });
      setSections([...sections, data.section]);
    }
    setEditing(null);
  }

  async function deleteSection(section) {
    await api(`/resumes/${resume.id}/sections/${section.id}`, { method: 'DELETE' });
    setSections(sections.filter((item) => item.id !== section.id));
  }

  async function bulkDelete() {
    await api(`/resumes/${resume.id}/sections/bulk-delete`, { method: 'POST', body: JSON.stringify({ sectionIds: selected }) });
    setSections(sections.filter((section) => !selected.includes(section.id)));
    setSelected([]);
  }

  async function uploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading('project');
    const form = new FormData();
    form.append('file', file);
    form.append('resumeId', resume.id);
    form.append('fileType', file.type === 'application/pdf' ? 'RESUME_PDF' : 'PROJECT_IMAGE');
    try {
      const data = await api('/uploads', { method: 'POST', body: form });
      setMessage(`Uploaded: ${data.file.url}`);
    } finally {
      setUploading('');
    }
  }

  async function uploadProfileImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading('profile');
    const form = new FormData();
    form.append('file', file);
    form.append('resumeId', resume.id);
    form.append('fileType', 'PROFILE_IMAGE');
    try {
      const data = await api('/uploads', { method: 'POST', body: form });
      const absoluteUrl = data.file.url.startsWith('http') ? data.file.url : `${API_URL.replace('/api', '')}${data.file.url}`;
      const updated = await api(`/resumes/${resume.id}/profile-image`, { method: 'PATCH', body: JSON.stringify({ profileImageUrl: absoluteUrl }) });
      setResume(updated.resume);
      setMessage('Profile image saved.');
    } finally {
      setUploading('');
    }
  }

  async function removeProfileImage() {
    const updated = await api(`/resumes/${resume.id}/profile-image`, { method: 'PATCH', body: JSON.stringify({ profileImageUrl: null }) });
    setResume(updated.resume);
    setMessage('Profile image removed.');
  }

  async function importResume(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading('import');
    const form = new FormData();
    form.append('resume', file);
    try {
      const data = await api(`/resumes/${resume.id}/import`, { method: 'POST', body: form });
      setSections([...sections, ...data.sections]);
      setMessage(`Imported ${data.sections.length} sections from resume file.`);
    } catch (error) {
      setMessage(error.message || 'Resume import failed.');
    } finally {
      setUploading('');
    }
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[1fr_auto]">
          <div>
            <input className="input max-w-xl text-xl font-black" value={resume?.title || ''} onChange={(e) => setResume({ ...resume, title: e.target.value })} onBlur={() => saveResumePatch({ title: resume.title })} />
            <p className="mt-2 text-sm font-semibold text-slate-600">Public URL: /resume/{user.username}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {resume?.profile_image_url ? <img className="h-16 w-16 rounded-md object-cover ring-2 ring-slate-200" src={resume.profile_image_url} alt="Profile preview" /> : <div className="grid h-16 w-16 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">No Image</div>}
              <label className="btn-secondary cursor-pointer"><ImagePlus size={16} /> {resume?.profile_image_url ? 'Replace Image' : 'Profile Image'}<input className="hidden" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={uploadProfileImage} /></label>
              {resume?.profile_image_url && <button className="btn-secondary" onClick={removeProfileImage}>Remove Image</button>}
              {uploading === 'profile' && <span className="text-sm font-semibold text-slate-500">Uploading profile image...</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="input w-52" value={resume?.template_slug || 'modern-developer'} onChange={(e) => saveResumePatch({ templateSlug: e.target.value })}>
              {templates.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button className="btn-secondary" onClick={() => setEditing({ title: '', type: 'custom', contentText: '' })}><Plus size={16} /> Section</button>
            <button className="btn-secondary" onClick={() => setAiModal(true)}><Brain size={16} /> AI</button>
            <button className="btn-secondary" onClick={() => setApiModal(true)}><KeyRound size={16} /> Own API</button>
            <label className="btn-secondary cursor-pointer"><ImagePlus size={16} /> {uploading === 'project' ? 'Uploading...' : 'Upload'}<input className="hidden" type="file" onChange={uploadFile} /></label>
            <label className="btn-secondary cursor-pointer">Import Resume<input className="hidden" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={importResume} /></label>
            <button className="btn-secondary" disabled={!selected.length} onClick={bulkDelete}><Trash2 size={16} /> Delete Selected</button>
          </div>
          {message && <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 lg:col-span-2">{message}</p>}
        </div>
      </section>
      <ResumeView
        data={data}
        editable
        selected={selected}
        template={resume?.template_slug}
        onSelect={toggleSelect}
        onEdit={(section) => setEditing({ ...section, contentText: JSON.stringify(section.content, null, 2) })}
        onDelete={deleteSection}
      />
      {editing && (
        <Modal title={editing.id ? 'Edit Section' : 'Add Section'} onClose={() => setEditing(null)}>
          <form className="grid gap-4" onSubmit={saveSection}>
            <input className="input" placeholder="Section title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <input className="input" placeholder="Section type" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} />
            <textarea className="input min-h-56 font-mono" placeholder='{"text":"Your content"}' value={editing.contentText} onChange={(e) => setEditing({ ...editing, contentText: e.target.value })} />
            <button className="btn-primary"><Save size={16} /> Save Section</button>
          </form>
        </Modal>
      )}
      {aiModal && <AiSuggestionModal resume={resume} onClose={() => setAiModal(false)} />}
      {apiModal && <ApiSettingsModal onClose={() => setApiModal(false)} />}
    </>
  );
}

function parseSectionContent(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return { text: value };
  }
}

function AiSuggestionModal({ resume, onClose }) {
  const [form, setForm] = useState({ resumeId: resume?.id, feature: 'summary', role: 'Node.js Backend Engineer', text: '' });
  const [result, setResult] = useState('');

  async function submit(event) {
    event.preventDefault();
    const data = await api('/ai/improve', { method: 'POST', body: JSON.stringify(form) });
    setResult(data.suggestion.content);
  }

  return (
    <Modal title="AI Resume Assistant" onClose={onClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <select className="input" value={form.feature} onChange={(e) => setForm({ ...form, feature: e.target.value })}>
          <option value="summary">Improve summary</option>
          <option value="bullets">Improve bullet points</option>
          <option value="project">Suggest project description</option>
          <option value="keywords">Suggest ATS keywords</option>
        </select>
        <input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        <textarea className="input min-h-40" placeholder="Paste weak resume text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
        <button className="btn-primary">Generate Suggestion</button>
      </form>
      {result && <pre className="mt-4 whitespace-pre-wrap rounded-md bg-slate-100 p-4 text-sm text-slate-700">{result}</pre>}
    </Modal>
  );
}

function ApiSettingsModal({ onClose }) {
  const [form, setForm] = useState({ provider: 'OpenAI-compatible', apiKey: '', baseUrl: 'https://api.openai.com/v1', modelName: 'gpt-4o-mini', isEnabled: true });
  const [status, setStatus] = useState('');

  async function submit(event) {
    event.preventDefault();
    setStatus('Validating and saving...');
    try {
      await api('/ai/settings', { method: 'POST', body: JSON.stringify(form) });
      setStatus('Saved. Your key is encrypted and never exposed to the frontend.');
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <Modal title="Use Your Own OpenAI API" onClose={onClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <select className="input" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
          <option>OpenAI</option>
          <option>OpenAI-compatible</option>
        </select>
        <input className="input" placeholder="API key" type="password" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
        <input className="input" placeholder="Base URL" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
        <input className="input" placeholder="Model name" value={form.modelName} onChange={(e) => setForm({ ...form, modelName: e.target.value })} />
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isEnabled} onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })} /> Enable my API key</label>
        <button className="btn-primary">Validate and Save</button>
      </form>
      {status && <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm font-semibold text-slate-700">{status}</p>}
    </Modal>
  );
}
