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

  const canEdit = user && data.resume?.id && data.resume.id !== 0 && canEditPublicResume(user, data);

  return (
    <main className="resume-detail-page mx-auto w-full max-w-[1760px] px-4 py-6 sm:px-6 lg:px-8">
      {canEdit && (
        <div className="mb-4 flex justify-end print:hidden">
          <Link className="btn-primary" to={`/editor?resumeId=${data.resume.id}`}><Pencil size={16} /> Edit</Link>
        </div>
      )}
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
        <ResumeView data={data} template={data.resume.template_slug} />
      </div>
    </main>
  );
}

function canEditPublicResume(user, data) {
  if (user.role === 'ADMIN') return true;
  const flags = user.feature_flags || {};
  const isOwner = data.resume.user_id === user.id;
  if (isOwner) return flags.canEditOwnResume ?? flags.canEditResume ?? true;
  if (user.role === 'SUB_ADMIN') {
    const canModerate = flags.canModerateResumes ?? true;
    return canModerate && data.owner?.role !== 'ADMIN';
  }
  return false;
}
