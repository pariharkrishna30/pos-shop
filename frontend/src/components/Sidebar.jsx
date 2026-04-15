import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: '🏠', label: 'Dashboard' },
  { to: '/pos', icon: '🛍️', label: 'POS' },
  { to: '/products', icon: '📦', label: 'Products' },
  { to: '/categories', icon: '🗂️', label: 'Categories' },
  { to: '/users', icon: '👥', label: 'Users' },
  { to: '/reports', icon: '📊', label: 'Reports' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar d-flex flex-column p-4">
      <div className="brand">
        <div className="brand-logo">PosFood</div>
        <div className="brand-subtitle">Simplify your sales</div>
      </div>

      <div className="user-card d-flex align-items-center">
        <div className="user-avatar">{user?.name?.[0] || 'U'}</div>
        <div>
          <h5>{user?.name || 'User'}</h5>
          <p>{user?.role?.toUpperCase() || 'STAFF'}</p>
        </div>
      </div>

      <nav className="nav flex-column mb-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-outline-danger logout-button" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
