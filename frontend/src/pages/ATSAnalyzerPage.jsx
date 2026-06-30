import { useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import { api } from '../api/client.js';

export default function ResumeAnalyzerPage() {
  const [mode, setMode] = useState('text');
  const [form, setForm] = useState({ resumeText: '', jobDescription: '' });
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function analyze(event) {
    event.preventDefault();
    setError('');
    setReport(null);
    setLoading(true);
    setProgress(25);
    try {
      let data;
      if (mode === 'file') {
        if (!file) throw new Error('Upload a PDF or DOCX resume first.');
        const payload = new FormData();
        payload.append('resume', file);
        payload.append('jobDescription', form.jobDescription);
        setProgress(55);
        data = await api('/ats/analyze-file', { method: 'POST', body: payload });
        setForm((current) => ({ ...current, resumeText: data.resumeText || current.resumeText }));
      } else {
        data = await api('/ats/analyze', { method: 'POST', body: JSON.stringify(form) });
      }
      setProgress(100);
      setReport(data.report);
    } catch (err) {
      setError(err.message || 'Resume analyzer failed.');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 400);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black text-ink">Resume Analyzer</h1>
      <p className="mt-2 text-slate-600">Analyze pasted resume text or upload a PDF/DOCX without logging in.</p>

      <div className="mt-6 inline-flex rounded-md border border-slate-200 bg-white p-1 shadow-soft">
        <button className={`btn px-4 ${mode === 'text' ? 'bg-ink text-white' : 'text-slate-600'}`} onClick={() => setMode('text')}><FileText size={16} /> Text Resume Analyzer</button>
        <button className={`btn px-4 ${mode === 'file' ? 'bg-ink text-white' : 'text-slate-600'}`} onClick={() => setMode('file')}><UploadCloud size={16} /> PDF Resume Analyzer</button>
      </div>

      <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={analyze}>
        {mode === 'text' ? (
          <textarea className="input min-h-80" placeholder="Paste resume text" value={form.resumeText} onChange={(e) => setForm({ ...form, resumeText: e.target.value })} />
        ) : (
          <label className="grid min-h-80 place-items-center rounded-md border border-dashed border-slate-300 bg-white p-6 text-center shadow-soft">
            <input className="hidden" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <span>
              <UploadCloud className="mx-auto mb-4" size={36} />
              <strong className="block text-ink">{file ? file.name : 'Upload PDF or DOCX resume'}</strong>
              <span className="mt-2 block text-sm text-slate-600">The backend extracts text and analyzes it in view mode.</span>
            </span>
          </label>
        )}
        <textarea className="input min-h-80" placeholder="Optional: paste job description for better keyword matching" value={form.jobDescription} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })} />
        <div className="lg:col-span-2">
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Resume'}</button>
          {loading && <div className="mt-3 h-2 overflow-hidden rounded bg-slate-200"><div className="h-full bg-mint transition-all" style={{ width: `${progress}%` }} /></div>}
        </div>
      </form>

      {error && <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
      {report && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-md bg-white p-5 shadow-soft">
            <p className="text-sm font-bold text-slate-500">Resume Score</p>
            <strong className="text-5xl text-ink">{report.score}/10</strong>
          </article>
          <ReportCard title="Issues" items={report.issues} />
          <ReportCard title="Missing Skills" items={report.missingSkills} />
          <ReportCard title="Missing Keywords" items={report.missingKeywords} />
          <ReportCard title="Formatting Problems" items={report.formattingProblems} />
          <ReportCard title="Grammar Issues" items={report.grammarIssues} />
          <article className="rounded-md bg-white p-5 shadow-soft md:col-span-3">
            <p className="font-bold text-ink">Improvement Suggestions</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{(report.suggestions || []).map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </div>
      )}
    </section>
  );
}

function ReportCard({ title, items = [] }) {
  return (
    <article className="rounded-md bg-white p-5 shadow-soft">
      <p className="font-bold text-ink">{title}</p>
      {items.length ? (
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{items.slice(0, 8).map((item) => <li key={item}>{item}</li>)}</ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">No major problems detected.</p>
      )}
    </article>
  );
}

