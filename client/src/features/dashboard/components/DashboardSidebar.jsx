import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Upload Book',
    path: '/dashboard/upload',
    icon: Upload,
  },
  {
    label: 'Manage Books',
    path: '/dashboard/manage',
    icon: BookOpen,
  },
];

export default function DashboardSidebar() {
  return (
    <aside className="w-64 bg-card border-r min-h-full">
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}