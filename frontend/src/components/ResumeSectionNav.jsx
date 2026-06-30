import { useEffect, useState } from 'react';

export default function ResumeSectionNav({ sections = [] }) {
  const [activeId, setActiveId] = useState(sections[0]?.navId || '');

  useEffect(() => {
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.2, 0.45, 0.7] }
    );

    sections.forEach((section) => {
      const node = document.getElementById(section.navId);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [sections]);

  if (!sections.length) return null;

  function scrollToSection(navId) {
    document.getElementById(navId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <aside className="group fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 md:block">
      <div className="flex min-h-40 w-3 flex-col items-center justify-center rounded-full bg-slate-900/80 py-3 shadow-soft transition-all group-hover:w-56 group-hover:items-stretch group-hover:rounded-md group-hover:bg-white group-hover:p-3 group-hover:ring-1 group-hover:ring-slate-200">
        <div className="grid gap-2 group-hover:hidden">
          {sections.slice(0, 8).map((section) => (
            <button
              key={section.navId}
              aria-label={`Go to ${section.title}`}
              className={`h-2 w-2 rounded-full ${activeId === section.navId ? 'bg-coral' : 'bg-white/80'}`}
              onClick={() => scrollToSection(section.navId)}
            />
          ))}
        </div>
        <div className="hidden gap-1 group-hover:grid">
          <p className="mb-2 px-2 text-xs font-black uppercase text-slate-400">Sections</p>
          {sections.map((section) => (
            <button
              key={section.navId}
              className={`rounded-md px-3 py-2 text-left text-sm font-bold transition ${
                activeId === section.navId ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => scrollToSection(section.navId)}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

