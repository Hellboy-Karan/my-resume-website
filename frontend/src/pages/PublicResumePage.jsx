import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ResumeView from '../components/ResumeView.jsx';

export default function PublicResumePage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/public/resume/${username}`).then(setData).catch((err) => setError(err.message));
  }, [username]);

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16 text-center font-bold text-coral">{error}</div>;
  return data ? <ResumeView data={data} template={data.resume.template_slug} /> : <div className="p-8">Loading resume...</div>;
}

