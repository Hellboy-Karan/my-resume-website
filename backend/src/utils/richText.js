import sanitizeHtml from 'sanitize-html';

const options = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a',
    'blockquote', 'h3', 'h4', 'span'
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: ['class']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noreferrer', target: '_blank' })
  }
};

export function sanitizeRichText(value) {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value, options).trim();
}

export function sanitizeContent(content) {
  if (!content || typeof content !== 'object') return content;
  if (Array.isArray(content)) return content.map(sanitizeContent);
  return Object.fromEntries(
    Object.entries(content).map(([key, value]) => {
      if (typeof value === 'string') return [key, sanitizeRichText(value)];
      if (value && typeof value === 'object') return [key, sanitizeContent(value)];
      return [key, value];
    })
  );
}
