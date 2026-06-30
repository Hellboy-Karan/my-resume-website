import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { api } from '../api/client.js';
import ResumeView from '../components/ResumeView.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function PublicResumePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/public/resume/${username}`).then(setData).catch((err) => setError(err.message));
  }, [username]);

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16 text-center font-bold text-coral">{error}</div>;
  if (!data) return <div className="p-8">Loading resume...</div>;

  const canEdit = user && data.resume?.id && data.resume.id !== 0 && (user.role === 'ADMIN' || data.resume.user_id === user.id);

  return (
    <>
      {canEdit && (
        <div className="mx-auto flex max-w-7xl justify-end px-4 pt-5 print:hidden">
          <Link className="btn-primary" to={`/editor?resumeId=${data.resume.id}`}><Pencil size={16} /> Edit</Link>
        </div>
      )}
      <ResumeView data={data} template={data.resume.template_slug} />
    </>
  );
}
