import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-grow pt-16">
        <DashboardSidebar />
        <main className="flex-grow p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}