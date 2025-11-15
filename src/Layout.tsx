import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './components/layout/TopNav';
import BottomNav from './components/layout/BottomNav';
import { useEffect } from 'react';

const Layout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  useEffect(() => {
    if (isDashboard) {
      document.body.classList.add('body-dashboard-bg');
    } else {
      document.body.classList.remove('body-dashboard-bg');
    }
    return () => {
      document.body.classList.remove('body-dashboard-bg');
    };
  }, [isDashboard]);
  return (
    <>
      <TopNav />
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
};

export default Layout;
