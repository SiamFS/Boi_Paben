import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
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

export default function DashboardSidebar({ isOpen, onClose, isMobile = false }) {
  const sidebarContent = (
    <nav className="p-4 space-y-2 h-full">
      {isMobile && (
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-lg font-semibold">Dashboard Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {sidebarItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/dashboard'}
          onClick={isMobile ? onClose : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )
          }
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={onClose}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isOpen && (
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-80 bg-card border-r z-50 md:hidden shadow-xl"
            >
              {sidebarContent}
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }
  // Desktop Sidebar
  return (
    <aside className="hidden md:flex w-64 bg-card border-r min-h-full">
      {sidebarContent}
    </aside>
  );
}

DashboardSidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  isMobile: PropTypes.bool,
};