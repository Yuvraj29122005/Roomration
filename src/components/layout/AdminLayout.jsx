import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="page-container gradient-mesh min-h-[calc(100vh-73px)]">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
