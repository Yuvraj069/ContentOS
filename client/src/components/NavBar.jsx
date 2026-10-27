import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Shared navigation bar — reused across Dashboard, Posts, Ideas
export default function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="logo-badge">C</span>
        <span className="logo-title">ContentOS</span>
      </div>
      <nav className="app-nav">
        <NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Dashboard
        </NavLink>
        <NavLink to="/posts" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Post Log
        </NavLink>
        <NavLink to="/ideas" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Ideas
        </NavLink>
      </nav>
      <div className="header-user">
        <span className="user-pill">@{user?.handle} ({user?.niche})</span>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Log Out</button>
      </div>
    </header>
  );
}
