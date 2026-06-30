import { Suspense, lazy, useEffect, useState } from 'react';
import { Eye, LayoutTemplate, Sparkles } from 'lucide-react';
import { api } from '../api/client.js';
import Skeleton from '../components/Skeleton.jsx';
import { templates } from '../data/templates.js';

const TemplatePreviewModal = lazy(() => import('../components/TemplatePreviewModal.jsx'));

export default function TemplateSelectorPage() {
  const [selected, setSelected] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    if (!selected || resumeData) return;
    api('/public/default-resume').then(setResumeData);
  }, [selected, resumeData]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase text-coral"><Sparkles size={16} /> Template Library</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Resume Templates</h1>
            <p className="mt-2 max-w-3xl text-slate-600">Choose ATS-friendly, developer, product-company, management, operations, and portfolio layouts. You can switch layouts any time from the resume editor.</p>
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
            {templates.length} professional formats
          </div>
        </div>
      </div>
      {!templates.length ? (
        <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-xl font-black text-ink">No templates available</h2>
          <p className="mt-2 text-slate-600">Add templates from the admin panel or seed data.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <article className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg" key={template.slug}>
              <div className="bg-slate-100 p-3">
                <img
                  className="aspect-[16/9] w-full rounded-md border border-slate-200 object-cover shadow-sm transition group-hover:scale-[1.01]"
                  src={template.image}
                  alt={`${template.name} template preview`}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = templates[0].image;
                  }}
                />
              </div>
              <div className="p-5">
                <p className="mb-2 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-black uppercase text-slate-600"><LayoutTemplate size={13} /> {templateCategory(template.slug)}</p>
                <h2 className="text-xl font-black text-ink">{template.name}</h2>
                <p className="mt-2 min-h-16 text-sm leading-6 text-slate-600">{template.description}</p>
                <button className="btn-primary mt-4 w-full" onClick={() => setSelected(template)}>
                  <Eye size={16} /> Preview Template
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {selected && (
        <Suspense fallback={<div className="fixed inset-0 z-40 grid place-items-center bg-white/80"><Skeleton lines={5} /></div>}>
          <TemplatePreviewModal template={selected} resumeData={resumeData || { owner: {}, resume: {}, sections: [] }} onClose={() => setSelected(null)} />
        </Suspense>
      )}
    </section>
  );
}

function templateCategory(slug) {
  if (slug.includes('product')) return 'Product Company';
  if (slug.includes('management') || slug.includes('operations') || slug.includes('consulting')) return 'Management';
  if (slug.includes('developer') || slug.includes('engineer')) return 'Engineering';
  if (slug.includes('portfolio') || slug.includes('creative')) return 'Portfolio';
  return 'Professional';
}
