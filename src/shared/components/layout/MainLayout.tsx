import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import { useEffect } from 'react';

const MainLayout = () => {
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

export default MainLayout;
