export const templates = [
  {
    slug: 'modern-developer',
    name: 'Modern Developer',
    description: 'Strong technical identity, project cards, and clean section rhythm.',
    image: templateImage('#111827', '#2dd4bf', '#f8fafc', 'cards')
  },
  {
    slug: 'professional',
    name: 'Professional',
    description: 'Classic recruiter-friendly sections with a polished corporate header.',
    image: templateImage('#ffffff', '#2563eb', '#e5e7eb', 'classic')
  },
  {
    slug: 'corporate',
    name: 'Corporate',
    description: 'Executive-feeling layout with strong hierarchy and business-focused spacing.',
    image: templateImage('#1f2937', '#60a5fa', '#f8fafc', 'bands')
  },
  {
    slug: 'minimal',
    name: 'Minimal',
    description: 'Lean spacing and restrained details for focused professional storytelling.',
    image: templateImage('#f8fafc', '#475569', '#ffffff', 'minimal')
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
    image: templateImage('#164e63', '#facc15', '#ecfeff', 'portfolio')
  },
  {
    slug: 'creative',
    name: 'Creative',
    description: 'Expressive layout for portfolio-heavy profiles with bold accents.',
    image: templateImage('#4c1d95', '#fb7185', '#faf5ff', 'creative')
  }
];

export function templateName(slug) {
  return templates.find((template) => template.slug === slug)?.name || slug || 'Modern Developer';
}

function templateImage(primary, accent, paper, variant) {
  const middle = {
    cards: `<rect x="352" y="170" width="250" height="110" rx="10" fill="white" stroke="#cbd5e1"/><rect x="632" y="170" width="280" height="110" rx="10" fill="white" stroke="#cbd5e1"/><rect x="352" y="310" width="560" height="140" rx="10" fill="white" stroke="#cbd5e1"/>`,
    classic: `<rect x="90" y="170" width="780" height="1" fill="#cbd5e1"/><rect x="90" y="210" width="780" height="1" fill="#cbd5e1"/><rect x="90" y="250" width="780" height="1" fill="#cbd5e1"/><rect x="90" y="290" width="780" height="1" fill="#cbd5e1"/>`,
    bands: `<rect x="48" y="158" width="864" height="70" rx="10" fill="white" stroke="#cbd5e1"/><rect x="48" y="252" width="864" height="70" rx="10" fill="white" stroke="#cbd5e1"/><rect x="48" y="346" width="864" height="70" rx="10" fill="white" stroke="#cbd5e1"/>`,
    minimal: `<rect x="140" y="180" width="680" height="14" rx="7" fill="${primary}" opacity=".72"/><rect x="140" y="225" width="520" height="10" rx="5" fill="${accent}"/><rect x="140" y="270" width="680" height="1" fill="#cbd5e1"/><rect x="140" y="316" width="620" height="1" fill="#cbd5e1"/>`,
    portfolio: `<rect x="70" y="174" width="250" height="170" rx="14" fill="white" stroke="#cbd5e1"/><rect x="354" y="174" width="250" height="170" rx="14" fill="white" stroke="#cbd5e1"/><rect x="638" y="174" width="250" height="170" rx="14" fill="white" stroke="#cbd5e1"/>`,
    creative: `<circle cx="790" cy="116" r="90" fill="${accent}" opacity=".22"/><rect x="70" y="180" width="360" height="250" rx="28" fill="white" stroke="#cbd5e1"/><rect x="470" y="180" width="360" height="250" rx="28" fill="white" stroke="#cbd5e1"/>`
  }[variant];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
    <rect width="960" height="540" fill="${paper}"/>
    <rect x="48" y="44" width="864" height="92" rx="12" fill="${primary}"/>
    <circle cx="96" cy="90" r="26" fill="${accent}"/>
    <rect x="144" y="72" width="300" height="16" rx="8" fill="white" opacity=".92"/>
    <rect x="144" y="102" width="430" height="12" rx="6" fill="white" opacity=".58"/>
    ${middle}
    <rect x="76" y="205" width="190" height="12" rx="6" fill="${primary}" opacity=".84"/>
    <rect x="76" y="240" width="150" height="10" rx="5" fill="${accent}"/>
    <rect x="380" y="194" width="210" height="12" rx="6" fill="${primary}" opacity=".76"/>
    <rect x="380" y="282" width="280" height="12" rx="6" fill="${primary}" opacity=".76"/>
    <rect x="380" y="374" width="360" height="12" rx="6" fill="${primary}" opacity=".76"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
