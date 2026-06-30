import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Brain, Eye, ImagePlus, KeyRound, Plus, Save, Trash2 } from 'lucide-react';
import { API_URL, api } from '../api/client.js';
import Modal from '../components/Modal.jsx';
import ResumeView from '../components/ResumeView.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { templates } from '../data/templates.js';

export default function ResumeEditorPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [resume, setResume] = useState(null);
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const [aiModal, setAiModal] = useState(false);
  const [apiModal, setApiModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState('');
  const [socialDraft, setSocialDraft] = useState([{ label: 'LinkedIn', url: '' }]);

  const data = useMemo(() => ({
    owner: resume?.owner ? { ...resume.owner, shortDescription: resume.owner.shortDescription || resume.title } : (user ? { name: user.name, username: user.username, email: user.email, shortDescription: resume?.title } : {}),
    resume: resume || {},
    sections
  }), [user, resume, sections]);
  const socialSection = useMemo(() => sections.find((section) => ['social-links', 'links'].includes(section.type)), [sections]);
  const socialSignature = JSON.stringify(socialSection?.content?.items || []);

  useEffect(() => {
    if (!user) return;
    api('/resumes')
      .then(async (data) => {
        const requestedId = searchParams.get('resumeId');
        const ownResume = (data.resumes || []).find((item) => item.user_id === user.id);
        const first = requestedId
          ? { id: requestedId }
          : ownResume || (await api('/resumes', { method: 'POST', body: JSON.stringify({ title: `${user.name} Resume` }) })).resume;
        const full = await api(`/resumes/${first.id}`);
        setResume(full.resume);
        setSections(full.sections);
      })
      .catch((error) => setMessage(error.message || 'Unable to load editable resume.'));
  }, [user, searchParams]);

  useEffect(() => {
    const items = normalizeSocialLinks(socialSection?.content?.items || []);
    setSocialDraft(items.length ? items : [{ label: 'LinkedIn', url: '' }]);
  }, [socialSignature]);

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
    if (!resume?.id) {
      setMessage('Please wait until your editable resume is loaded, then import again.');
      return;
    }
    setUploading('import');
    const form = new FormData();
    form.append('resume', file);
    try {
      const data = await api(`/resumes/${resume.id}/import`, { method: 'POST', body: form });
      const importedSections = (data.sections || []).filter(Boolean);
      setSections([...sections, ...importedSections]);
      setMessage(`Imported ${importedSections.length} sections from resume file.`);
    } catch (error) {
      setMessage(error.message || 'Resume import failed.');
    } finally {
      setUploading('');
    }
  }

  async function saveSocialLinks() {
    const items = normalizeSocialLinks(socialDraft).slice(0, 5);
    const payload = {
      title: 'Social/Profile Links',
      type: 'social-links',
      content: { items },
      sortOrder: socialSection?.sort_order || 2
    };
    if (socialSection?.id) {
      const data = await api(`/resumes/${resume.id}/sections/${socialSection.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setSections(sections.map((section) => section.id === data.section.id ? data.section : section));
    } else {
      const data = await api(`/resumes/${resume.id}/sections`, { method: 'POST', body: JSON.stringify(payload) });
      setSections([...sections, data.section]);
    }
    setMessage('Social/profile links saved.');
  }

  return (
    <>
      <div className="resume-editor-workspace mx-auto grid max-w-[1900px] items-start gap-6 px-4 py-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <aside className="editor-controls print:hidden xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto xl:pr-2">
          <div className="grid gap-5 pb-4">
            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
              <label className="text-xs font-black uppercase text-slate-500">Owner Name</label>
              <input className="input mt-2 text-lg font-black bg-slate-50" value={resume?.owner?.name || user.name || ''} readOnly />
              <label className="mt-4 block text-xs font-black uppercase text-slate-500">Resume Short Description</label>
              <textarea className="input mt-2 min-h-24" value={resume?.title || ''} onChange={(e) => setResume({ ...resume, title: e.target.value })} onBlur={() => saveResumePatch({ title: resume.title })} placeholder="Senior MERN Stack Developer with 5 years of experience." />
              <Link className="mt-3 inline-flex text-sm font-bold text-coral hover:underline" to="/settings">Update owner profile in Settings</Link>
              <p className="mt-3 break-words rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">Profile URL: /resume/{resume?.slug || resume?.owner?.username || user.username}</p>
              <div className="mt-4 flex items-center gap-3 rounded-md bg-slate-50 p-3">
                {resume?.profile_image_url ? <img className="h-20 w-20 rounded-md object-cover ring-2 ring-slate-200" src={resume.profile_image_url} alt="Profile preview" /> : <div className="grid h-20 w-20 shrink-0 place-items-center rounded-md bg-white text-xs font-bold text-slate-500 ring-1 ring-slate-200">No Image</div>}
                <div className="grid min-w-0 flex-1 gap-2">
                  <label className="btn-secondary h-10 cursor-pointer px-3"><ImagePlus size={16} /> {resume?.profile_image_url ? 'Replace' : 'Upload'}<input className="hidden" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={uploadProfileImage} /></label>
                  {resume?.profile_image_url && <button className="btn-secondary h-10 px-3" onClick={removeProfileImage}>Remove</button>}
                  {uploading === 'profile' && <span className="text-xs font-semibold text-slate-500">Uploading...</span>}
                </div>
              </div>
            </section>

            <SocialLinksEditor items={socialDraft} setItems={setSocialDraft} onSave={saveSocialLinks} />

            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
              <label className="text-xs font-black uppercase text-slate-500">Template</label>
              <select className="input mt-2 h-12" value={resume?.template_slug || 'modern-developer'} onChange={(e) => saveResumePatch({ templateSlug: e.target.value })}>
                {templates.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </select>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <button className="btn-secondary h-11 justify-start" onClick={() => setEditing({ title: '', type: 'custom', contentText: '' })}><Plus size={16} /> Section</button>
                <button className="btn-secondary h-11 justify-start" onClick={() => setPreviewOpen(true)}><Eye size={16} /> Preview</button>
                <button className="btn-secondary h-11 justify-start" onClick={() => setAiModal(true)}><Brain size={16} /> AI</button>
                <button className="btn-secondary h-11 justify-start" onClick={() => setApiModal(true)}><KeyRound size={16} /> Own API</button>
                <label className="btn-secondary h-11 cursor-pointer justify-start"><ImagePlus size={16} /> {uploading === 'project' ? 'Uploading...' : 'Upload'}<input className="hidden" type="file" onChange={uploadFile} /></label>
                <label className="btn-secondary h-11 cursor-pointer justify-start">Import Resume<input className="hidden" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={importResume} /></label>
              </div>
              <button className="btn-secondary mt-3 h-11 w-full justify-start" disabled={!selected.length} onClick={bulkDelete}><Trash2 size={16} /> Delete Selected</button>
            </section>

            {message && <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}
          </div>
        </aside>

        <main className="resume-preview-shell min-w-0 rounded-md border border-slate-200 bg-white shadow-soft">
          <ResumeView
            data={data}
            editable
            selected={selected}
            template={resume?.template_slug}
            onSelect={toggleSelect}
            onEdit={(section) => setEditing({ ...section, contentText: JSON.stringify(section.content, null, 2) })}
            onDelete={deleteSection}
          />
        </main>
      </div>
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
      {previewOpen && (
        <Modal title="Resume Preview" onClose={() => setPreviewOpen(false)}>
          <div className="max-h-[75vh] overflow-auto rounded-md border border-slate-200">
            <ResumeView data={data} template={resume?.template_slug} />
          </div>
        </Modal>
      )}
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

function normalizeSocialLinks(items) {
  return (items || [])
    .map((item) => {
      if (typeof item === 'string') return { label: 'Link', url: item };
      return { label: String(item.label || '').trim(), url: String(item.url || '').trim() };
    })
    .filter((item) => item.label && item.url)
    .slice(0, 5);
}

function SocialLinksEditor({ items, setItems, onSave }) {
  function updateLink(index, patch) {
    setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function addLink() {
    if (items.length >= 5) return;
    setItems([...items, { label: '', url: '' }]);
  }

  function removeLink(index) {
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    setItems(next.length ? next : [{ label: 'LinkedIn', url: '' }]);
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase text-ink">Social/Profile Links</h3>
          <p className="text-sm text-slate-600">Add up to 5 links such as LinkedIn, GitHub, Portfolio, Twitter/X, or Instagram.</p>
        </div>
        <button className="btn-secondary px-3" type="button" onClick={addLink} disabled={items.length >= 5}>Add Link</button>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item, index) => (
          <div className="grid gap-2" key={index}>
            <input className="input" placeholder="Label" value={item.label} onChange={(event) => updateLink(index, { label: event.target.value })} />
            <input className="input" placeholder="https://example.com/profile" value={item.url} onChange={(event) => updateLink(index, { url: event.target.value })} />
            <button className="btn-secondary px-3" type="button" onClick={() => removeLink(index)}>Remove</button>
          </div>
        ))}
      </div>
      <button className="btn-primary mt-4" type="button" onClick={onSave}>Save Links</button>
    </section>
  );
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
