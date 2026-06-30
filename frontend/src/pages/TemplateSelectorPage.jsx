import { Suspense, lazy, useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
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
      <h1 className="text-3xl font-black text-ink">Resume Templates</h1>
      <p className="mt-2 text-slate-600">Switch layouts any time from the resume editor.</p>
      {!templates.length ? (
        <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-xl font-black text-ink">No templates available</h2>
          <p className="mt-2 text-slate-600">Add templates from the admin panel or seed data.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <article className="rounded-md border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg" key={template.slug}>
              <img
                className="aspect-[16/9] w-full rounded-md border border-slate-200 object-cover"
                src={template.image}
                alt={`${template.name} template preview`}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.src = templates[0].image;
                }}
              />
              <h2 className="mt-4 text-xl font-black text-ink">{template.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{template.description}</p>
              <button className="btn-secondary mt-4 w-full" onClick={() => setSelected(template)}>
                <Eye size={16} /> Preview
              </button>
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

