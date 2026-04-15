import { useEffect, useState } from 'react';
import api from '../api';

const initialForm = {
  name: '',
  barcode: '',
  price: 0,
  stock_quantity: 0,
  category_id: '',
  image: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const [productsResp, categoriesResp] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/categories'),
      ]);
      setProducts(productsResp.data.products);
      setCategories(categoriesResp.data.categories);
    } catch (err) {
      setMessage('Unable to load products.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setSelected(null);
    setForm(initialForm);
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const endpoint = selected ? `/api/products/${selected.id}` : '/api/products';
      const method = selected ? 'put' : 'post';
      await api[method](endpoint, form);
      await loadData();
      resetForm();
      setMessage('Product saved successfully.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Failed to save product.');
    }
  };

  const handleEdit = (product) => {
    setSelected(product);
    setForm({
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id || '',
      image: product.image || '',
    });
    setMessage('Editing product details.');
  };

  const handleDelete = async (product) => {
    if (!window.confirm('Delete this product?')) {
      return;
    }
    try {
      await api.delete(`/api/products/${product.id}`);
      await loadData();
      setMessage('Product deleted.');
    } catch (err) {
      setMessage('Unable to delete product.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage inventory, pricing, and barcode data.</p>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="row g-12">
        <div className="col-lg-12">
          <div className="section-card">
            <h5 className="section-title">{selected ? 'Edit product' : 'Add product'}</h5>
            <form onSubmit={handleSubmit}>
                <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Name</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Barcode</label>
                <input className="form-control" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} required />
              </div>
              </div>
                <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Price</label>
                <input type="number" min="0" step="0.01" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Stock quantity</label>
                <input type="number" min="0" className="form-control" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} required />
              </div>
              </div>
              <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Unassigned</option>
                  {categories.map((category) => (
                    <option value={category.id} key={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Image URL</label>
                <input className="form-control" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
              </div>
              <div className="gap-5 col-md-6">
                <button className="btn btn-primary me-2" type="submit">Save product</button>
                {selected && (
                  <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>
        </div>

        <div className="col-lg-12">
          <div className="card section-card table-card">
            <h5 className="section-title">Product catalog</h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Barcode</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.barcode}</td>
                      <td>${Number(product.price).toFixed(2)}</td>
                      <td>{product.stock_quantity}</td>
                      <td>{product.category?.name || '—'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(product)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!products.length && (
                    <tr>
                      <td colSpan="6" className="text-muted">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}
