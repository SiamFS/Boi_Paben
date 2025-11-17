import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import DashboardSidebar from './DashboardSidebar';
import { Button } from '@/components/ui/Button';

export default function DashboardLayout({ onReady }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    // Signal that layout is ready when component mounts
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-grow pt-16">
        {/* Desktop Sidebar */}
        <DashboardSidebar 
          isOpen={true} 
          onClose={() => {}} 
          isMobile={false} 
        />
        
        {/* Mobile Sidebar */}
        <DashboardSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={closeMobileSidebar} 
          isMobile={true} 
        />

        <main className="flex-grow w-full">          {/* Mobile Menu Button - Fixed Position */}
          {isMobile && (
            <div className="sticky top-16 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 md:hidden shadow-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMobileSidebar}
                className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Menu className="h-4 w-4" />
                Dashboard Menu
              </Button>
            </div>
          )}

          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}