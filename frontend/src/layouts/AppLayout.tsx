import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, LogOut, Megaphone, Settings, Shirt, Users } from 'lucide-react';
import { Profile, Store } from '../types/database';

type Props = {
  profile: Profile;
  store: Store;
  onLogout: () => void;
};

const items = [
  { to: '/', label: 'Dashboard', icon: <BarChart3 size={18} /> },
  { to: '/clientes', label: 'Clientes', icon: <Users size={18} /> },
  { to: '/produtos', label: 'Produtos', icon: <Shirt size={18} /> },
  { to: '/campanhas', label: 'Campanhas', icon: <Megaphone size={18} /> },
  { to: '/configuracoes', label: 'Configurações', icon: <Settings size={18} /> },
];

export function AppLayout({ profile, store, onLogout }: Props) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand-block">
          <div className="brand-dot" />
          <div>
            <strong>Color Sales AI</strong>
            <span>{store.name}</span>
          </div>
        </Link>

        <nav className="nav-menu">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-box">
            <strong>{profile.full_name || 'Administrador'}</strong>
            <span>{profile.role}</span>
          </div>
          <button className="ghost-button full-width" onClick={onLogout}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
