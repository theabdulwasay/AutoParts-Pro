import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, deleteCategory } from '../api';
import { toast } from '../components/Toast';

const TrashSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getCategories()
      .then(r => setCats(r.data.results || r.data))
      .finally(() => setLoading(false));
  };
  
  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createCategory({ name, description: desc });
      toast('Part category added successfully!', 'success');
      setName(''); setDesc(''); load();
    } catch (err) {
      toast('Error: ' + (err.response?.data?.name?.[0] || 'Failed to create category'), 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, n) => {
    if (!window.confirm(`Are you sure you want to delete category "${n}"? Parts in this category will be affected.`)) return;
    try {
      await deleteCategory(id); 
      toast('Category deleted successfully', 'success'); 
      load();
    } catch {
      toast('Cannot delete category. Check if it is linked to any existing parts.', 'error');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
      {/* Left: Add Category */}
      <div className="card" style={{ alignSelf: 'start' }}>
        <div className="card-header">
          <span className="card-title">Add New Category</span>
        </div>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input 
              className="form-control" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Engine Components" 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              rows={3} 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              placeholder="Brief description of parts included..." 
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
            {saving ? 'Adding…' : '+ Add Category'}
          </button>
        </form>
      </div>

      {/* Right: Category List */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Part Categories ({cats.length})</span>
        </div>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          cats.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p>No categories found in the system.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Inventory Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cats.map(c => (
                    <tr key={c.id}>
                      <td><strong style={{ color: '#fff' }}>{c.name}</strong></td>
                      <td style={{ color: '#94a3b8' }}>{c.description || 'No description provided'}</td>
                      <td>
                        <span className="badge badge-confirmed">
                          {c.parts_count || 0} unique part(s)
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-danger btn-sm btn-icon" 
                          title="Delete"
                          onClick={() => handleDelete(c.id, c.name)}
                        >
                          <TrashSVG />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
