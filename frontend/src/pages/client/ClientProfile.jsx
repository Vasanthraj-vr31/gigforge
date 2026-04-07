import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMe, updateMe } from '../../api/user';
import { getProjects } from '../../api/projects';
import { useAuth } from '../../context/useAuth';
import { uploadImage } from '../../api/upload';

export default function ClientProfile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [projectsCount, setProjectsCount] = useState(0);
  const [form, setForm] = useState({
    profileImage: user?.profileImage || '',
    bio: user?.bio || '',
  });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMe(form);
      updateUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setForm((prev) => ({ ...prev, profileImage: `http://localhost:5000${url}` }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (!user?._id) return;
      try {
        const me = await getMe();
        updateUser(me);
        setForm({
          profileImage: me.profileImage || '',
          bio: me.bio || '',
        });
        const allProjects = await getProjects();
        const mine = allProjects.filter(
          (p) => String(p.clientId?._id || p.clientId) === String(user._id)
        );
        setProjectsCount(mine.length);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [user?._id, updateUser]);

  return (
    <form className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100" onSubmit={save}>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Client Profile</h2>
      
      <div className="flex items-center gap-6 mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-teal-500 shadow-sm">
          {form.profileImage ? (
            <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
          )}
        </div>
        <div>
          <label className="btn btn-outline cursor-pointer relative overflow-hidden">
            <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileChange} 
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="mb-6 bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Posted Projects</h3>
          <p className="text-3xl font-bold text-teal-600">{projectsCount}</p>
        </div>
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Company/Client Bio</label>
        <textarea 
          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
          rows="4"
          placeholder="Tell freelancers about your company or what you do..." 
          value={form.bio} 
          onChange={(e) => setForm({ ...form, bio: e.target.value })} 
        />
      </div>

      <button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5" disabled={saving}>
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
