import { Outlet } from 'react-router-dom';
import Header from './Header';
import MobileNav from './MobileNav';

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <Header />
      <main className="page-container gradient-mesh min-h-[calc(100vh-73px)]">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
