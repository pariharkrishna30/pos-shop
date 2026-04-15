import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'cashier',
};

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data.users);
    } catch {
      setMessage('Unable to load user list.');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await api.post('/api/users', form);
      setForm(initialForm);
      await loadUsers();
      setMessage('User created.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleDelete = async (selected) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await api.delete(`/api/users/${selected.id}`);
      await loadUsers();
      setMessage('User deleted.');
    } catch {
      setMessage('Unable to delete user.');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div>
        <h1>Users</h1>
        <p className="text-muted">Only administrators can manage users.</p>
        <div className="alert alert-warning">Access denied for non-admin users.</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage cashier and admin accounts.</p>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="row g-12">
        <div className="col-lg-12">
          <div className="section-card">
            <h5 className="section-title">Add user</h5>
            <form onSubmit={handleSubmit}>
                <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Name</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              </div>
              <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              </div>
              <button className="btn btn-primary w-45" type="submit">Create user</button>
            </form>
          </div>
        </div>

        <div className="col-lg-12 mt-4">
          <div className="card section-card table-card">
            <h5 className="section-title">User list</h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => (
                    <tr key={account.id}>
                      <td>{account.name}</td>
                      <td>{account.email}</td>
                      <td>{account.role}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(account)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr>
                      <td colSpan="4" className="text-muted">No users created yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
