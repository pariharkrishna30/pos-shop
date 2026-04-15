import { useEffect, useState } from 'react';
import api from '../api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data.categories);
    } catch (err) {
      setMessage('Unable to load categories.');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await api.post('/api/categories', { name, description });
      setName('');
      setDescription('');
      await loadCategories();
      setMessage('Category created successfully.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm('Delete this category?')) return;

    try {
      await api.delete(`/api/categories/${category.id}`);
      await loadCategories();
      setMessage('Category deleted.');
    } catch {
      setMessage('Unable to delete category.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Create and manage product categories.</p>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="row g-12">
        <div className="col-lg-12">
          <div className="section-card">
            <h5 className="section-title">Add Category</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <button className="btn btn-primary w-45" type="submit">Create category</button>
            </form>
          </div>
        </div>

        <div className="col-lg-12 mt-4">
          <div className="card section-card table-card">
            <h5 className="section-title">Category list</h5>
            <ul className="list-group list-group-flush">
              {categories.map((category) => (
                <li key={category.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{category.name}</strong>
                    <div className="text-muted small">{category.description}</div>
                  </div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(category)}>
                    Delete
                  </button>
                </li>
              ))}
              {!categories.length && <li className="list-group-item text-muted">No categories yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
