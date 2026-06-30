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
  },
  {
    slug: 'product-company',
    name: 'Product Company',
    description: 'Built for product-based companies: impact metrics, ownership, launches, and cross-functional work.',
    image: templateImage('#0f172a', '#14b8a6', '#f8fafc', 'product')
  },
  {
    slug: 'senior-product-engineer',
    name: 'Senior Product Engineer',
    description: 'Engineering resume format for SaaS/product teams with systems, metrics, and shipped features.',
    image: templateImage('#172554', '#38bdf8', '#eff6ff', 'engineer')
  },
  {
    slug: 'management-executive',
    name: 'Management Executive',
    description: 'Management-company format for leadership, operations, team ownership, KPIs, and business outcomes.',
    image: templateImage('#312e81', '#f59e0b', '#f8fafc', 'management')
  },
  {
    slug: 'operations-manager',
    name: 'Operations Manager',
    description: 'Clear operations resume for process ownership, vendor coordination, reporting, and delivery excellence.',
    image: templateImage('#064e3b', '#a3e635', '#f7fee7', 'operations')
  },
  {
    slug: 'consulting-leadership',
    name: 'Consulting Leadership',
    description: 'Structured format for client-facing leaders, program managers, and business transformation roles.',
    image: templateImage('#1e293b', '#fb7185', '#fff7ed', 'consulting')
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
    creative: `<circle cx="790" cy="116" r="90" fill="${accent}" opacity=".22"/><rect x="70" y="180" width="360" height="250" rx="28" fill="white" stroke="#cbd5e1"/><rect x="470" y="180" width="360" height="250" rx="28" fill="white" stroke="#cbd5e1"/>`,
    product: `<rect x="64" y="170" width="250" height="92" rx="12" fill="white" stroke="#cbd5e1"/><text x="92" y="225" font-family="Arial" font-size="34" font-weight="700" fill="${primary}">42%</text><rect x="346" y="170" width="250" height="92" rx="12" fill="white" stroke="#cbd5e1"/><text x="374" y="225" font-family="Arial" font-size="34" font-weight="700" fill="${accent}">3.2x</text><rect x="628" y="170" width="250" height="92" rx="12" fill="white" stroke="#cbd5e1"/><text x="656" y="225" font-family="Arial" font-size="34" font-weight="700" fill="${primary}">12</text><rect x="64" y="306" width="814" height="114" rx="14" fill="white" stroke="#cbd5e1"/>`,
    engineer: `<rect x="70" y="168" width="360" height="270" rx="14" fill="white" stroke="#cbd5e1"/><rect x="110" y="214" width="280" height="12" rx="6" fill="${primary}" opacity=".8"/><rect x="110" y="254" width="220" height="10" rx="5" fill="${accent}"/><rect x="470" y="168" width="370" height="70" rx="14" fill="white" stroke="#cbd5e1"/><rect x="470" y="264" width="370" height="70" rx="14" fill="white" stroke="#cbd5e1"/><rect x="470" y="360" width="370" height="70" rx="14" fill="white" stroke="#cbd5e1"/>`,
    management: `<rect x="70" y="172" width="820" height="64" rx="12" fill="white" stroke="#cbd5e1"/><rect x="70" y="264" width="250" height="156" rx="12" fill="white" stroke="#cbd5e1"/><rect x="354" y="264" width="250" height="156" rx="12" fill="white" stroke="#cbd5e1"/><rect x="638" y="264" width="250" height="156" rx="12" fill="white" stroke="#cbd5e1"/><rect x="104" y="204" width="560" height="10" rx="5" fill="${accent}"/>`,
    operations: `<rect x="80" y="170" width="130" height="260" rx="14" fill="${primary}" opacity=".92"/><rect x="250" y="170" width="610" height="50" rx="10" fill="white" stroke="#cbd5e1"/><rect x="250" y="250" width="610" height="50" rx="10" fill="white" stroke="#cbd5e1"/><rect x="250" y="330" width="610" height="50" rx="10" fill="white" stroke="#cbd5e1"/><circle cx="145" cy="230" r="22" fill="${accent}"/><circle cx="145" cy="300" r="22" fill="${accent}"/><circle cx="145" cy="370" r="22" fill="${accent}"/>`,
    consulting: `<rect x="78" y="170" width="790" height="86" rx="14" fill="white" stroke="#cbd5e1"/><rect x="78" y="290" width="370" height="132" rx="14" fill="white" stroke="#cbd5e1"/><rect x="498" y="290" width="370" height="132" rx="14" fill="white" stroke="#cbd5e1"/><path d="M110 222 C250 160 380 284 540 208 S760 194 840 232" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>`
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
