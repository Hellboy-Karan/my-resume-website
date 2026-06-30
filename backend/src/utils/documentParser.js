import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromUpload(file) {
  if (!file) return '';
  if (file.mimetype === 'application/pdf') {
    const parsed = await pdfParse(file.buffer);
    return parsed.text || '';
  }
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.originalname.toLowerCase().endsWith('.docx')
  ) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return parsed.value || '';
  }
  return file.buffer.toString('utf8');
}

export function extractResumeSections(text) {
  const normalized = String(text).replace(/\r/g, '').trim();
  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
  const findBlock = (labels) => {
    const start = lines.findIndex((line) => labels.some((label) => line.toLowerCase().includes(label)));
    if (start === -1) return '';
    const next = lines.findIndex((line, index) => index > start && /^[A-Z][A-Za-z ]{2,25}$/.test(line));
    return lines.slice(start + 1, next === -1 ? start + 8 : next).join(' ');
  };

  const skills = findBlock(['skills', 'technical skills'])
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    personalInfo: {
      name: lines[0] || '',
      email: normalized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '',
      phone: normalized.match(/(?:\+?\d[\d\s-]{8,}\d)/)?.[0] || ''
    },
    summary: findBlock(['summary', 'profile', 'objective']) || lines.slice(1, 4).join(' '),
    experience: findBlock(['experience', 'work history']),
    education: findBlock(['education']),
    skills,
    projects: findBlock(['projects']),
    certifications: findBlock(['certifications', 'certificates']),
    languages: findBlock(['languages']),
    achievements: findBlock(['achievements', 'awards']),
    links: [...normalized.matchAll(/https?:\/\/\S+/g)].map((match) => match[0]),
    rawText: normalized
  };
}

