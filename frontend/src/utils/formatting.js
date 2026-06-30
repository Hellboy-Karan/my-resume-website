const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'A', 'BLOCKQUOTE', 'H3', 'H4', 'SPAN']);
const allowedAttrs = new Set(['href', 'target', 'rel', 'class']);

export function isHtml(value = '') {
  return /<\/?[a-z][\s\S]*>/i.test(String(value));
}

export function plainTextToHtml(value = '') {
  const lines = String(value).replace(/\r/g, '').split('\n');
  const html = [];
  let list = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (list) {
        html.push(`</${list}>`);
        list = null;
      }
      html.push('<br />');
      continue;
    }
    const bullet = trimmed.match(/^[-*•]\s+(.*)$/);
    const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      const nextList = bullet ? 'ul' : 'ol';
      if (list !== nextList) {
        if (list) html.push(`</${list}>`);
        html.push(`<${nextList}>`);
        list = nextList;
      }
      html.push(`<li>${escapeHtml(bullet?.[1] || numbered?.[1] || trimmed)}</li>`);
      continue;
    }
    if (list) {
      html.push(`</${list}>`);
      list = null;
    }
    html.push(`<p>${escapeHtml(trimmed)}</p>`);
  }
  if (list) html.push(`</${list}>`);
  return html.join('');
}

export function sanitizeHtml(html = '') {
  if (typeof window === 'undefined') return '';
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  doc.body.querySelectorAll('*').forEach((node) => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value || '';
      if (!allowedAttrs.has(name) || name.startsWith('on')) node.removeAttribute(attr.name);
      if (name === 'href' && !/^(https?:|mailto:|\/)/i.test(value)) node.removeAttribute(attr.name);
    });
    if (node.tagName === 'A') {
      node.setAttribute('rel', 'noreferrer');
      node.setAttribute('target', '_blank');
    }
  });
  return doc.body.innerHTML;
}

export function formatRichText(value = '') {
  const source = isHtml(value) ? value : plainTextToHtml(value);
  return sanitizeHtml(source);
}

export function richTextToPlain(value = '') {
  if (typeof document === 'undefined') return String(value || '').replace(/<[^>]+>/g, ' ');
  const container = document.createElement('div');
  container.innerHTML = formatRichText(value);
  return (container.textContent || container.innerText || '').replace(/\s+/g, ' ').trim();
}

export function publicResumeUrl(slugOrUsername = '') {
  const slug = String(slugOrUsername || '').replace(/^\/+/, '');
  const path = `/resume/${slug}`;
  if (typeof window === 'undefined' || !window.location?.origin) return path;
  return `${window.location.origin}${path}`;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
