export const templates = [
  {
    slug: 'modern-developer',
    name: 'Modern Developer',
    description: 'Strong technical identity, project cards, and clean section rhythm.',
    image: templateImage('#111827', '#2dd4bf', '#f8fafc')
  },
  {
    slug: 'ats-friendly',
    name: 'ATS Friendly',
    description: 'Simple headings, readable typography, and machine-friendly content flow.',
    image: templateImage('#ffffff', '#2563eb', '#e5e7eb')
  },
  {
    slug: 'minimal',
    name: 'Minimal',
    description: 'Lean spacing and restrained details for focused professional storytelling.',
    image: templateImage('#f8fafc', '#475569', '#ffffff')
  },
  {
    slug: 'sidebar',
    name: 'Sidebar',
    description: 'Compact profile rail with detailed experience and project content.',
    image: templateImage('#0f172a', '#fb7185', '#ffffff')
  },
  {
    slug: 'portfolio',
    name: 'Portfolio Style',
    description: 'Visual project-first presentation for resume websites.',
    image: templateImage('#164e63', '#facc15', '#ecfeff')
  }
];

export function templateName(slug) {
  return templates.find((template) => template.slug === slug)?.name || slug || 'Modern Developer';
}

function templateImage(primary, accent, paper) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
    <rect width="960" height="540" fill="${paper}"/>
    <rect x="48" y="44" width="864" height="92" rx="12" fill="${primary}"/>
    <circle cx="96" cy="90" r="26" fill="${accent}"/>
    <rect x="144" y="72" width="300" height="16" rx="8" fill="white" opacity=".92"/>
    <rect x="144" y="102" width="430" height="12" rx="6" fill="white" opacity=".58"/>
    <rect x="48" y="170" width="270" height="280" rx="12" fill="white" stroke="#cbd5e1"/>
    <rect x="352" y="170" width="560" height="60" rx="10" fill="white" stroke="#cbd5e1"/>
    <rect x="352" y="258" width="560" height="60" rx="10" fill="white" stroke="#cbd5e1"/>
    <rect x="352" y="346" width="560" height="104" rx="10" fill="white" stroke="#cbd5e1"/>
    <rect x="76" y="205" width="190" height="12" rx="6" fill="${primary}" opacity=".84"/>
    <rect x="76" y="240" width="150" height="10" rx="5" fill="${accent}"/>
    <rect x="380" y="194" width="210" height="12" rx="6" fill="${primary}" opacity=".76"/>
    <rect x="380" y="282" width="280" height="12" rx="6" fill="${primary}" opacity=".76"/>
    <rect x="380" y="374" width="360" height="12" rx="6" fill="${primary}" opacity=".76"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

