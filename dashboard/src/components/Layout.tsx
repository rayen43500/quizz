import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import './Avatar.css';
import './Layout.css';

const NAV = [
  { to: '/app', end: true, label: 'Accueil', icon: '🏠' },
  { to: '/app/quizzes', label: 'Quiz', icon: '📝' },
  { to: '/app/sessions', label: 'Sessions Live', icon: '🎬' },
  { to: '/app/students', label: 'Étudiants', icon: '👥' },
  { to: '/app/ai-generator', label: 'IA Generator', icon: '✨' },
  { to: '/app/analytics', label: 'Analytics', icon: '📈' },
  { to: '/app/reports', label: 'Rapports', icon: '📊' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <Link to="/app" className="logo">
          <span className="logo-icon">Q</span>
          <div>
            <span className="logo-text">Quisi</span>
            <span className="logo-tag">Teacher</span>
          </div>
        </Link>
        <nav>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link to="/app/profile" className="user-card">
            <Avatar src={user?.avatar} firstName={user?.firstName} lastName={user?.lastName} size="md" />
            <div>
              <p className="user-name">{user?.firstName} {user?.lastName}</p>
              <p className="user-role">{user?.institution || 'Enseignant'}</p>
            </div>
          </Link>
          <button className="btn btn-secondary btn-block" onClick={handleLogout}>Déconnexion</button>
          <Link to="/" className="sidebar-home-link">← Page d'accueil</Link>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
