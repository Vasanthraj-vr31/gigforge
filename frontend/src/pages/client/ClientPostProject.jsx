import { useState } from 'react';
import toast from 'react-hot-toast';
import { createProject } from '../../api/projects';

export default function ClientPostProject() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    district: '',
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProject({ ...form, budget: Number(form.budget) });
      toast.success('Project created');
      setForm({ title: '', description: '', budget: '', deadline: '', district: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-t-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Post a New Project</h2>
        <p className="text-teal-50 text-lg">Describe what you need and get competitive bids from top freelancers.</p>
      </div>
      <form className="bg-white p-8 rounded-b-2xl shadow-lg border border-slate-100 flex flex-col gap-5" onSubmit={submit}>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
          <input className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400" name="title" value={form.title} onChange={onChange} placeholder="e.g. Need a logo designer" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project Description</label>
          <textarea className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400" name="description" value={form.description} onChange={onChange} placeholder="Provide details about the project scope, deliverables, and expectations..." rows="5" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Budget (Rs)</label>
            <input className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400" type="number" name="budget" value={form.budget} onChange={onChange} placeholder="e.g. 5000" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">District Preference</label>
            <input className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400" name="district" value={form.district} onChange={onChange} placeholder="e.g. Chennai" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
          <input className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-700" type="date" name="deadline" value={form.deadline} onChange={onChange} required />
        </div>

        <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5" disabled={saving}>
          {saving ? 'Posting...' : 'Post Project'}
        </button>
      </form>
    </div>
  );
}

