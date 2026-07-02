import { NavLink, Outlet } from 'react-router-dom';
import { CycleIcon, MedicalIcon, SettingsIcon, TodayIcon, TrendsIcon } from './icons';

const tabs = [
  { to: '/', label: 'Today', icon: TodayIcon, end: true },
  { to: '/cycle', label: 'Cycle', icon: CycleIcon },
  { to: '/medical', label: 'Medical', icon: MedicalIcon },
  { to: '/trends', label: 'Trends', icon: TrendsIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function Layout() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet />
      </main>
      <nav className="tabbar">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `tabbar__item${isActive ? ' active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
