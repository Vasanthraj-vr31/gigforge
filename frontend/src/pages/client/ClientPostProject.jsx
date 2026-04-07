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
    <form className="panel grid" onSubmit={submit}>
      <h2>Post Project</h2>
      <input className="input" name="title" value={form.title} onChange={onChange} placeholder="Project title" />
      <textarea className="textarea" name="description" value={form.description} onChange={onChange} placeholder="Project description" />
      <div className="grid grid-2">
        <input className="input" name="budget" value={form.budget} onChange={onChange} placeholder="Budget" />
        <input className="input" name="district" value={form.district} onChange={onChange} placeholder="District" />
      </div>
      <input className="input" type="date" name="deadline" value={form.deadline} onChange={onChange} />
      <button className="btn" disabled={saving}>{saving ? 'Posting...' : 'Post Project'}</button>
    </form>
  );
}

