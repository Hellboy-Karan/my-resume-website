import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import { API_URL, api } from '../api/client.js';
import Skeleton from '../components/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const professionalFields = [
  ['skills', 'Skills'],
  ['experience', 'Experience'],
  ['education', 'Education'],
  ['projects', 'Projects'],
  ['achievements', 'Achievements'],
  ['languages', 'Languages'],
  ['awards', 'Awards'],
  ['interests', 'Interests'],
  ['customSections', 'Custom Sections']
];

const emptyCertificate = {
  name: '',
  organization: '',
  link: '',
  image: '',
  description: ''
};

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(Boolean(user));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api('/users/me/settings')
      .then((data) => {
        const next = toForm(data.user);
        setForm(next);
        setInitial(next);
      })
      .catch((err) => setError(err.message || 'Unable to load profile settings.'))
      .finally(() => setLoading(false));
  }, [user]);

  const canAddLink = useMemo(() => (form?.socialLinks || []).length < 5, [form]);

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black text-ink">Profile Settings</h1>
        <p className="mt-3 text-slate-600">Login to manage your profile, resume description, certificates, and social links.</p>
        <Link className="btn-primary mt-6" to="/login">Login</Link>
      </section>
    );
  }

  if (loading || !form) {
    return <section className="mx-auto max-w-6xl px-4 py-10"><Skeleton lines={10} /></section>;
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateProfessional(key, value) {
    setForm((current) => ({
      ...current,
      professionalInfo: { ...current.professionalInfo, [key]: value }
    }));
  }

  function updateCertificate(index, patch) {
    setForm((current) => ({
      ...current,
      certificates: current.certificates.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    }));
  }

  function addCertificate() {
    setForm((current) => ({ ...current, certificates: [...current.certificates, { ...emptyCertificate }] }));
  }

  function removeCertificate(index) {
    setForm((current) => ({ ...current, certificates: current.certificates.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function updateLink(index, patch) {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    }));
  }

  function addLink() {
    if (!canAddLink) return;
    setForm((current) => ({ ...current, socialLinks: [...current.socialLinks, { label: '', url: '' }] }));
  }

  function removeLink(index) {
    setForm((current) => ({ ...current, socialLinks: current.socialLinks.filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function uploadProfileImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading('profile');
    setError('');
    const body = new FormData();
    body.append('file', file);
    body.append('fileType', 'PROFILE_IMAGE');
    try {
      const data = await api('/uploads', { method: 'POST', body });
      const absoluteUrl = data.file.url.startsWith('http') ? data.file.url : `${API_URL.replace('/api', '')}${data.file.url}`;
      updateField('profileImageUrl', absoluteUrl);
    } catch (err) {
      setError(err.message || 'Profile image upload failed.');
    } finally {
      setUploading('');
    }
  }

  async function uploadCertificateImage(index, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(`certificate-${index}`);
    setError('');
    const body = new FormData();
    body.append('file', file);
    body.append('fileType', 'PROJECT_IMAGE');
    try {
      const data = await api('/uploads', { method: 'POST', body });
      const absoluteUrl = data.file.url.startsWith('http') ? data.file.url : `${API_URL.replace('/api', '')}${data.file.url}`;
      updateCertificate(index, { image: absoluteUrl });
    } catch (err) {
      setError(err.message || 'Certificate image upload failed.');
    } finally {
      setUploading('');
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        name: form.name.trim(),
        profileImageUrl: form.profileImageUrl || null,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        postalCode: form.postalCode,
        aboutMe: form.aboutMe,
        shortDescription: form.shortDescription,
        profileTitle: form.profileTitle,
        professionalInfo: form.professionalInfo,
        certificates: cleanCertificates(form.certificates),
        socialLinks: cleanLinks(form.socialLinks)
      };
      const data = await api('/users/me/settings', { method: 'PUT', body: JSON.stringify(payload) });
      updateUser(data.user);
      const next = toForm(data.user);
      setForm(next);
      setInitial(next);
      setMessage('Profile settings saved successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save profile settings.');
    } finally {
      setSaving(false);
    }
  }

  function cancelChanges() {
    setForm(initial);
    setError('');
    setMessage('');
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-coral">Account</p>
          <h1 className="mt-1 text-3xl font-black text-ink">Profile Settings</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Update your public owner information, profile description, certificates, and professional details.</p>
        </div>
        <Link className="btn-secondary" to="/resume">My Resume</Link>
      </div>

      {message && <p className="mt-5 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}
      {error && <p className="mt-5 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}

      <form className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" onSubmit={saveSettings}>
        <div className="grid gap-6">
          <SettingsCard title="General Information">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Owner Name" value={form.name} onChange={(value) => updateField('name', value)} required />
              <TextField label="Email" value={form.email} readOnly />
              <TextField label="Phone Number" value={form.phone} onChange={(value) => updateField('phone', value)} />
              <TextField label="Current Job Role / Profile Title" value={form.profileTitle} onChange={(value) => updateField('profileTitle', value)} />
            </div>
            <TextArea label="Resume Short Description" value={form.shortDescription} onChange={(value) => updateField('shortDescription', value)} rows={3} />
            <TextArea label="About Me" value={form.aboutMe} onChange={(value) => updateField('aboutMe', value)} rows={5} />
          </SettingsCard>

          <SettingsCard title="Address">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Address" value={form.address} onChange={(value) => updateField('address', value)} />
              <TextField label="City" value={form.city} onChange={(value) => updateField('city', value)} />
              <TextField label="State" value={form.state} onChange={(value) => updateField('state', value)} />
              <TextField label="Country" value={form.country} onChange={(value) => updateField('country', value)} />
              <TextField label="Postal Code" value={form.postalCode} onChange={(value) => updateField('postalCode', value)} />
            </div>
          </SettingsCard>

          <SettingsCard title="Professional Information">
            <div className="grid gap-4 md:grid-cols-2">
              {professionalFields.map(([key, label]) => (
                <TextArea
                  key={key}
                  label={label}
                  value={form.professionalInfo[key] || ''}
                  onChange={(value) => updateProfessional(key, value)}
                  rows={4}
                  placeholder="Add one item per line or write a short paragraph"
                />
              ))}
            </div>
          </SettingsCard>

          <SettingsCard
            title="Certificates"
            action={<button className="btn-secondary px-3" type="button" onClick={addCertificate}><Plus size={16} /> Add Certificate</button>}
          >
            {!form.certificates.length && <p className="rounded-md bg-slate-50 p-4 text-sm font-semibold text-slate-500">No certificates added yet.</p>}
            <div className="grid gap-4">
              {form.certificates.map((certificate, index) => (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4" key={index}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <strong className="text-ink">Certificate {index + 1}</strong>
                    <button className="btn-secondary px-3" type="button" onClick={() => removeCertificate(index)}><Trash2 size={16} /> Delete</button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <TextField label="Certificate Name" value={certificate.name} onChange={(value) => updateCertificate(index, { name: value })} />
                    <TextField label="Issuing Organization" value={certificate.organization} onChange={(value) => updateCertificate(index, { organization: value })} />
                    <TextField label="Certificate Link" value={certificate.link} onChange={(value) => updateCertificate(index, { link: value })} />
                    <div>
                      <label className="text-xs font-black uppercase text-slate-500">Certificate Image</label>
                      <div className="mt-2 flex items-center gap-3">
                        {certificate.image && <img className="h-14 w-14 rounded-md object-cover ring-1 ring-slate-200" src={certificate.image} alt={certificate.name || 'Certificate'} />}
                        <label className="btn-secondary h-11 cursor-pointer px-3">
                          <ImagePlus size={16} /> {uploading === `certificate-${index}` ? 'Uploading...' : 'Upload'}
                          <input className="hidden" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => uploadCertificateImage(index, event)} />
                        </label>
                      </div>
                    </div>
                  </div>
                  <TextArea label="Description" value={certificate.description} onChange={(value) => updateCertificate(index, { description: value })} rows={3} />
                </div>
              ))}
            </div>
          </SettingsCard>
        </div>

        <aside className="grid gap-6 self-start lg:sticky lg:top-24">
          <SettingsCard title="Profile Photo">
            <div className="flex items-center gap-4">
              {form.profileImageUrl ? (
                <img className="h-24 w-24 rounded-md object-cover ring-1 ring-slate-200" src={form.profileImageUrl} alt={form.name || 'Profile'} />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">No Image</div>
              )}
              <div className="grid gap-2">
                <label className="btn-secondary cursor-pointer px-3">
                  <ImagePlus size={16} /> {uploading === 'profile' ? 'Uploading...' : 'Upload Image'}
                  <input className="hidden" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={uploadProfileImage} />
                </label>
                {form.profileImageUrl && (
                  <button className="btn-secondary px-3" type="button" onClick={() => updateField('profileImageUrl', '')}>
                    <X size={16} /> Remove
                  </button>
                )}
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Social Links"
            action={<button className="btn-secondary px-3" type="button" disabled={!canAddLink} onClick={addLink}><Plus size={16} /> Add</button>}
          >
            <p className="mb-4 text-sm text-slate-600">Add up to 5 public links such as LinkedIn, GitHub, Portfolio, Twitter/X, or Instagram.</p>
            <div className="grid gap-3">
              {form.socialLinks.map((link, index) => (
                <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3" key={index}>
                  <TextField label="Platform Name" value={link.label} onChange={(value) => updateLink(index, { label: value })} />
                  <TextField label="URL" value={link.url} onChange={(value) => updateLink(index, { url: value })} />
                  <button className="btn-secondary px-3" type="button" onClick={() => removeLink(index)}><Trash2 size={16} /> Remove</button>
                </div>
              ))}
              {!form.socialLinks.length && <p className="rounded-md bg-slate-50 p-4 text-sm font-semibold text-slate-500">No social links added yet.</p>}
            </div>
          </SettingsCard>

          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-soft">
            <div className="grid gap-3">
              <button className="btn-primary w-full" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}</button>
              <button className="btn-secondary w-full" type="button" onClick={cancelChanges} disabled={saving}>Cancel</button>
            </div>
          </div>
        </aside>
      </form>
    </section>
  );
}

function SettingsCard({ title, action, children }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-ink">{title}</h2>
        {action}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function TextField({ label, value, onChange, readOnly = false, required = false }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-slate-500">{label}</span>
      <input
        className={`input mt-2 ${readOnly ? 'bg-slate-50 text-slate-500' : ''}`}
        value={value || ''}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        required={required}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 4, placeholder = '' }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-slate-500">{label}</span>
      <textarea
        className="input mt-2 min-h-28"
        rows={rows}
        value={value || ''}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

function toForm(user) {
  return {
    name: user?.name || '',
    email: user?.email || '',
    profileImageUrl: user?.profile_image_url || user?.profileImageUrl || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || '',
    postalCode: user?.postal_code || user?.postalCode || '',
    aboutMe: user?.about_me || user?.aboutMe || '',
    shortDescription: user?.short_description || user?.shortDescription || '',
    profileTitle: user?.profile_title || user?.profileTitle || '',
    professionalInfo: user?.professional_info || user?.professionalInfo || {},
    certificates: Array.isArray(user?.certificates) ? user.certificates : [],
    socialLinks: Array.isArray(user?.social_links) ? user.social_links : Array.isArray(user?.socialLinks) ? user.socialLinks : []
  };
}

function cleanCertificates(items) {
  return (items || [])
    .map((item) => ({
      name: String(item.name || '').trim(),
      organization: String(item.organization || '').trim(),
      link: String(item.link || '').trim(),
      image: String(item.image || '').trim(),
      description: String(item.description || '').trim()
    }))
    .filter((item) => item.name || item.organization || item.link || item.image || item.description);
}

function cleanLinks(items) {
  return (items || [])
    .map((item) => ({ label: String(item.label || '').trim(), url: String(item.url || '').trim() }))
    .filter((item) => item.label && item.url)
    .slice(0, 5);
}
