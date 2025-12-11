import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

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
      <div className="sticky top-0 z-40">
        <TopNav />
      </div>
      <main>
        <Outlet />
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </>
  );
};

export default MainLayout;
