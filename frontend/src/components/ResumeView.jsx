import { Download, Edit3, ExternalLink, Trash2 } from 'lucide-react';
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
  if (['social-links', 'links'].includes(section.type) && Array.isArray(content.items)) {
    return (
      <div className="flex flex-wrap gap-3">
        {content.items.slice(0, 5).map((item, index) => {
          const link = typeof item === 'string' ? { label: 'Link', url: item } : item;
          if (!link?.url) return null;
          return (
            <a className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:border-coral hover:text-coral" href={link.url} target={link.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer" key={`${link.url}-${index}`}>
              {link.label || 'Profile'} <ExternalLink size={14} />
            </a>
          );
        })}
      </div>
    );
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
  if (template === 'product-company') return 'bg-slate-950 text-white';
  if (template === 'senior-product-engineer') return 'bg-blue-950 text-white';
  if (template === 'management-executive') return 'bg-indigo-950 text-white';
  if (template === 'operations-manager') return 'bg-emerald-950 text-white';
  if (template === 'consulting-leadership') return 'bg-slate-800 text-white';
  if (template === 'minimal') return 'bg-white';
  if (template === 'corporate') return 'bg-slate-800 text-white';
  return 'bg-white';
}

function profileImageClass(template) {
  if (template === 'sidebar') return 'h-28 w-28 rounded-md object-cover ring-4 ring-coral';
  if (template === 'portfolio') return 'h-24 w-24 rounded-md object-cover ring-4 ring-yellow-300';
  if (template === 'creative') return 'h-28 w-28 rounded-full object-cover ring-4 ring-coral';
  if (template === 'product-company') return 'h-24 w-24 rounded-2xl object-cover ring-4 ring-teal-300';
  if (template === 'senior-product-engineer') return 'h-24 w-24 rounded-md object-cover ring-4 ring-sky-300';
  if (template === 'management-executive') return 'h-24 w-24 rounded-full object-cover ring-4 ring-amber-300';
  if (template === 'operations-manager') return 'h-24 w-24 rounded-md object-cover ring-4 ring-lime-300';
  if (template === 'consulting-leadership') return 'h-24 w-24 rounded-md object-cover ring-4 ring-rose-300';
  if (template === 'minimal') return 'h-20 w-20 rounded-md object-cover ring-1 ring-slate-200';
  return 'h-24 w-24 rounded-md object-cover ring-4 ring-white shadow-soft';
}

function accentLabel(template) {
  const labels = {
    'standard-template': 'Standard Template',
    'product-company': 'Product Impact Resume',
    'senior-product-engineer': 'Senior Product Engineering',
    'management-executive': 'Management Leadership',
    'operations-manager': 'Operations Excellence',
    'consulting-leadership': 'Consulting Leadership'
  };
  return labels[template];
}

function renderStandardContent(section) {
  const content = section.content || {};
  if (section.type === 'skills' && Array.isArray(content.items)) {
    return <p className="text-[15px] leading-7 text-black">{content.items.join(', ')}</p>;
  }
  if (['social-links', 'links'].includes(section.type) && Array.isArray(content.items)) {
    return (
      <p className="text-[15px] leading-7 text-black">
        {content.items.slice(0, 5).map((item) => (typeof item === 'string' ? item : `${item.label || 'Link'}: ${item.url}`)).join(' | ')}
      </p>
    );
  }
  if (Array.isArray(content.items)) {
    return (
      <ul className="ml-8 list-disc space-y-2 text-[15px] leading-7 text-black">
        {content.items.map((item, index) => (
          <li key={index}>{typeof item === 'string' ? item : item.description || item.name || JSON.stringify(item)}</li>
        ))}
      </ul>
    );
  }
  const entries = Object.entries(content).filter(([, value]) => {
    if (Array.isArray(value)) return value.length;
    return String(value || '').trim();
  });
  if (entries.length > 1) {
    return (
      <div className="space-y-1 text-[15px] leading-7 text-black">
        {entries.map(([key, value]) => (
          <p key={key}>
            <strong>{toTitle(key)}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
          </p>
        ))}
      </div>
    );
  }
  return <p className="text-justify text-[15px] leading-8 text-black">{content.text || content.body || JSON.stringify(content)}</p>;
}

function toTitle(value) {
  return String(value).replace(/([A-Z])/g, ' $1').replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()).trim();
}

function StandardResumeView({ owner, resume, sections, editable, selected, onSelect, onEdit, onDelete }) {
  const socialLinks = sections.find((section) => ['social-links', 'links'].includes(section.type))?.content?.items || owner.links || [];
  const linkLabels = socialLinks.slice(0, 2).map((link) => (typeof link === 'string' ? 'Link' : link.label)).filter(Boolean);

  return (
    <div className="resume-print-area bg-white font-serif text-black">
      <ResumeSectionNav sections={sections} />
      <div className="mx-auto max-w-[980px] bg-white px-10 py-10">
        <div className="print:hidden mb-4 flex justify-end">
          <button className="btn-secondary font-sans" onClick={() => window.print()}>
            <Download size={16} /> Print as PDF
          </button>
        </div>
        <header className="text-center">
          <h1 className="text-[30px] font-bold leading-tight text-black">{owner.name}</h1>
          <p className="mt-4 text-[16px] leading-7 text-black">
            {[owner.phone, owner.email ? `Email: ${owner.email}` : '', ...linkLabels].filter(Boolean).map((item, index) => (
              <span key={`${item}-${index}`}>{index > 0 ? ' || ' : ''}{item}</span>
            ))}
          </p>
          <p className="mx-auto mt-2 max-w-4xl text-[16px] leading-7 text-black">{owner.title || resume.title}</p>
        </header>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section id={section.navId} className="scroll-mt-24" key={section.id}>
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-zinc-500 pb-4">
                <div className="flex items-center gap-3">
                  {editable && <input className="print:hidden" type="checkbox" checked={selected.includes(section.id)} onChange={() => onSelect?.(section.id)} />}
                  <h2 className="text-[24px] font-normal uppercase leading-none tracking-normal text-black">{section.title}</h2>
                </div>
                {editable && (
                  <div className="print:hidden flex gap-2 font-sans">
                    <button className="btn-secondary px-3" onClick={() => onEdit?.(section)} aria-label="Edit section"><Edit3 size={16} /></button>
                    <button className="btn-secondary px-3" onClick={() => onDelete?.(section)} aria-label="Delete section"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
              {renderStandardContent(section)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ResumeView({ data, editable = false, selected = [], onSelect, onEdit, onDelete, template = 'modern-developer' }) {
  const owner = data?.owner || {};
  const resume = data?.resume || {};
  const sections = (data?.sections || []).filter(hasSectionData).map((section, index) => ({
    ...section,
    navId: navIdFor(section, index)
  }));
  const sidebar = template === 'sidebar';
  const darkHeader = ['sidebar', 'portfolio', 'creative', 'corporate', 'product-company', 'senior-product-engineer', 'management-executive', 'operations-manager', 'consulting-leadership'].includes(template);
  const headerText = darkHeader ? 'text-white' : 'text-ink';
  const mutedText = darkHeader ? 'text-white/75' : 'text-slate-600';

  if (template === 'standard-template') {
    return <StandardResumeView owner={owner} resume={resume} sections={sections} editable={editable} selected={selected} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} />;
  }

  return (
    <div className={`resume-print-area ${sidebar ? 'grid gap-0 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]' : ''}`}>
      <ResumeSectionNav sections={sections} />
      <section className={`border-b border-slate-200 ${sidebar ? 'min-h-full' : ''} ${headerStyle(template)}`}>
        <div className={`mx-auto max-w-7xl ${sidebar ? 'px-6 py-8 lg:px-8' : 'px-4 py-10 sm:px-6 lg:px-8'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <p className="text-sm font-bold uppercase text-coral">{accentLabel(template) || resume.template_slug || template}</p>
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
            <span className="print:hidden"><RoleBadge role={owner.role || resume.owner?.role || 'USER'} /></span>
            {owner.email && <span>Email: {owner.email}</span>}
            <span>{owner.location}</span>
            <span>Profile URL: /resume/{owner.username}</span>
          </div>
          {Array.isArray(owner.links) && owner.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {owner.links.slice(0, 5).map((link, index) => (
                <a className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-bold ${['sidebar', 'portfolio', 'creative', 'corporate'].includes(template) ? 'border-white/25 text-white hover:bg-white/10' : 'border-slate-200 text-ink hover:border-coral hover:text-coral'}`} href={link.url} target={link.url?.startsWith('/') ? undefined : '_blank'} rel="noreferrer" key={`${link.url}-${index}`}>
                  {link.label || 'Profile'} <ExternalLink size={14} />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
