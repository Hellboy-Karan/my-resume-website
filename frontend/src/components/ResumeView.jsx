import { Download, Edit3, Trash2 } from 'lucide-react';
import ResumeSectionNav from './ResumeSectionNav.jsx';
import RoleBadge from './RoleBadge.jsx';

function renderContent(section) {
  const content = section.content || {};
  if (section.type === 'skills') {
    return <div className="flex flex-wrap gap-2">{(content.items || []).map((skill) => <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700" key={skill}>{skill}</span>)}</div>;
  }
  if (section.type === 'projects') {
    return <div className="grid gap-3 md:grid-cols-3">{(content.items || []).map((project) => <article className="rounded-md border border-slate-200 p-4" key={project.name}><h4 className="font-bold text-ink">{project.name}</h4><p className="mt-2 text-sm leading-6 text-slate-600">{project.description}</p></article>)}</div>;
  }
  if (Array.isArray(content.items)) {
    return <ul className="grid gap-2">{content.items.map((item, index) => <li className="text-slate-700" key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ul>;
  }
  return <p className="max-w-4xl text-base leading-7 text-slate-700">{content.text || content.body || JSON.stringify(content)}</p>;
}

function hasSectionData(section) {
  const content = section.content || {};
  if (section.is_visible === false) return false;
  if (!content || typeof content !== 'object') return Boolean(section.title);
  if (typeof content.text === 'string' && content.text.trim()) return true;
  if (typeof content.body === 'string' && content.body.trim()) return true;
  if (Array.isArray(content.items) && content.items.length) return true;
  return Object.values(content).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.values(value).some(Boolean);
    return Boolean(String(value || '').trim());
  });
}

function navIdFor(section, index) {
  const base = String(section.type || section.title || `section-${index}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `resume-section-${base || index}-${section.id || index}`;
}

function headerStyle(template) {
  if (template === 'sidebar') return 'bg-slate-950 text-white';
  if (template === 'portfolio') return 'bg-cyan-950 text-white';
  if (template === 'creative') return 'bg-violet-950 text-white';
  if (template === 'minimal') return 'bg-white';
  if (template === 'corporate') return 'bg-slate-800 text-white';
  return 'bg-white';
}

function profileImageClass(template) {
  if (template === 'sidebar') return 'h-28 w-28 rounded-md object-cover ring-4 ring-coral';
  if (template === 'portfolio') return 'h-24 w-24 rounded-md object-cover ring-4 ring-yellow-300';
  if (template === 'creative') return 'h-28 w-28 rounded-full object-cover ring-4 ring-coral';
  if (template === 'minimal') return 'h-20 w-20 rounded-md object-cover ring-1 ring-slate-200';
  return 'h-24 w-24 rounded-md object-cover ring-4 ring-white shadow-soft';
}

export default function ResumeView({ data, editable = false, selected = [], onSelect, onEdit, onDelete, template = 'modern-developer' }) {
  const owner = data?.owner || {};
  const resume = data?.resume || {};
  const sections = (data?.sections || []).filter(hasSectionData).map((section, index) => ({
    ...section,
    navId: navIdFor(section, index)
  }));
  const sidebar = template === 'sidebar';
  const headerText = ['sidebar', 'portfolio', 'creative', 'corporate'].includes(template) ? 'text-white' : 'text-ink';
  const mutedText = ['sidebar', 'portfolio', 'creative', 'corporate'].includes(template) ? 'text-white/75' : 'text-slate-600';

  return (
    <div className={sidebar ? 'grid gap-6 lg:grid-cols-[320px_1fr]' : ''}>
      <ResumeSectionNav sections={sections} />
      <section className={`border-b border-slate-200 ${headerStyle(template)}`}>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <p className="text-sm font-bold uppercase text-coral">{resume.template_slug || template}</p>
            <button className="btn-secondary" onClick={() => window.print()}>
              <Download size={16} /> Print as PDF
            </button>
          </div>
          <div className={`mt-3 flex flex-wrap items-center gap-5 ${template === 'minimal' ? 'gap-4' : ''}`}>
            {resume.profile_image_url && (
              <img className={profileImageClass(template)} src={resume.profile_image_url} alt={owner.name || 'Profile'} />
            )}
            <h1 className={`max-w-4xl text-4xl font-black md:text-6xl ${headerText}`}>{owner.name}</h1>
          </div>
          <p className={`mt-4 max-w-3xl text-lg font-semibold leading-8 ${mutedText}`}>{owner.title || resume.title}</p>
          <div className={`mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold ${mutedText}`}>
            <span className={headerText}>Owner: {owner.name || 'Resume owner'}</span>
            <RoleBadge role={owner.role || resume.owner?.role || 'USER'} />
            <span>{owner.email}</span>
            <span>{owner.location}</span>
            <span>/resume/{owner.username}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="grid gap-5">
          {sections.map((section) => (
            <article id={section.navId} key={section.id} className="scroll-mt-24 rounded-md border border-slate-200 bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {editable && <input type="checkbox" checked={selected.includes(section.id)} onChange={() => onSelect?.(section.id)} />}
                  <h2 className="text-xl font-black text-ink">{section.title}</h2>
                </div>
                {editable && (
                  <div className="flex gap-2">
                    <button className="btn-secondary px-3" onClick={() => onEdit?.(section)} aria-label="Edit section"><Edit3 size={16} /></button>
                    <button className="btn-secondary px-3" onClick={() => onDelete?.(section)} aria-label="Delete section"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
              {renderContent(section)}
            </article>
          ))}
        </div>
        {resume.watermark_enabled && (
          <p className="mt-8 rounded-md border border-slate-200 bg-white p-4 text-center text-sm font-semibold text-slate-600">
            Developed by Karan Kumar Sharma | Email: sk5485633@gmail.com
          </p>
        )}
      </section>
    </div>
  );
}
