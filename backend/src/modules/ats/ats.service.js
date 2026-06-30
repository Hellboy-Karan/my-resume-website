import { query } from '../../database/mysql.js';

const stopWords = new Set(['and', 'the', 'with', 'for', 'you', 'are', 'this', 'that', 'from', 'will', 'have', 'has']);

function keywords(text) {
  return [...new Set(String(text).toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || [])]
    .filter((word) => !stopWords.has(word))
    .slice(0, 120);
}

export class AtsService {
  analyze(resumeText, jobDescription = '') {
    const resumeWords = new Set(keywords(resumeText));
    const jobWords = keywords(jobDescription || resumeText);
    const matchingSkills = jobWords.filter((word) => resumeWords.has(word));
    const missingKeywords = jobWords.filter((word) => !resumeWords.has(word)).slice(0, 20);
    const score = Math.min(10, Math.max(1, Math.round((matchingSkills.length / Math.max(jobWords.length, 1)) * 10) || 5));
    const issues = [];
    if (String(resumeText).length < 900) issues.push('Resume content looks short. Add more context, impact, and role-specific details.');
    if (!/\d+%|\$\d+|\d+\+/.test(resumeText)) issues.push('Add measurable outcomes using numbers, percentages, scale, or cost/time savings.');
    if (!/experience|work|employment/i.test(resumeText)) issues.push('Experience section is missing or hard to detect.');
    if (!/education|degree|university|college/i.test(resumeText)) issues.push('Education section is missing or hard to detect.');
    const formattingProblems = [];
    if (resumeText.includes('\t')) formattingProblems.push('Replace tab-heavy alignment with simple ATS-friendly spacing.');
    if ((resumeText.match(/[•]/g) || []).length > 20) formattingProblems.push('Keep bullets concise and consistent.');
    const grammarIssues = [];
    if (/\bi\b/.test(resumeText)) grammarIssues.push('Capitalize standalone “I” and review sentence casing.');
    if (/\s{3,}/.test(resumeText)) grammarIssues.push('Remove repeated spaces.');
    const suggestions = [
      'Mirror the most important job-title keywords in your summary.',
      'Add measurable impact to each experience bullet using numbers, scale, or business outcome.',
      'Group backend, frontend, database, cloud, and AI skills for quick ATS parsing.',
      missingKeywords.length ? `Consider adding relevant missing keywords: ${missingKeywords.slice(0, 8).join(', ')}.` : 'Keyword coverage is strong. Focus on sharper impact bullets.'
    ];
    return {
      score,
      scoreLabel: `${score}/10`,
      issues,
      missingSkills: missingKeywords.filter((word) => /react|node|mysql|mongo|aws|docker|redis|api|system|design|jwt|rbac/i.test(word)),
      missingKeywords,
      matchingSkills,
      formattingProblems,
      grammarIssues,
      suggestions
    };
  }

  async saveReport({ userId, resumeId, report }) {
    const result = await query(
      `INSERT INTO ats_reports (user_id, resume_id, score, matching_skills, missing_keywords, suggestions)
       VALUES (:userId, :resumeId, :score, CAST(:matchingSkills AS JSON), CAST(:missingKeywords AS JSON), CAST(:suggestions AS JSON))`,
      {
        userId,
        resumeId,
        score: report.score,
        matchingSkills: JSON.stringify(report.matchingSkills),
        missingKeywords: JSON.stringify(report.missingKeywords),
        suggestions: JSON.stringify(report.suggestions)
      }
    );
    return { id: result.insertId, ...report };
  }
}
