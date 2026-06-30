import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import ResumeView from '../components/ResumeView.jsx';

export default function HomePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/public/default-resume').then(setData);
  }, []);

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="font-semibold text-slate-600">Create, analyze, edit, and share resume websites with companies.</p>
          <div className="flex gap-2">
            <Link className="btn-primary" to="/editor">Build Resume</Link>
            <Link className="btn-secondary" to="/resume-analyzer">Analyze Resume</Link>
          </div>
        </div>
      </div>
      {data && <ResumeView data={data} />}
    </>
  );
}
