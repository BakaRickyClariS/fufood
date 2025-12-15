import { Outlet, useLocation, useMatches } from 'react-router-dom';
import { useEffect } from 'react';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

type RouteHandle = {
  headerVariant?: 'default' | 'simple' | 'none';
  footer?: boolean;
};

const MainLayout = () => {
  const location = useLocation();
  const matches = useMatches();
  const isDashboard = location.pathname === '/';

  // 取得當前路由的 handle 設定
  const currentHandle = matches
    .filter((match) => match.handle)
    .map((match) => match.handle as RouteHandle)
    .pop();

  // 根據 handle 決定是否顯示 header 和 footer
  const showHeader =
    currentHandle?.headerVariant !== 'none' &&
    currentHandle?.headerVariant !== 'simple';
  const showFooter = currentHandle?.footer !== false;

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
      {showHeader && (
        <div className="sticky top-0 z-40">
          <TopNav />
        </div>
      )}
      <main>
        <Outlet />
      </main>
      {showFooter && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <BottomNav />
          </div>
        </div>
      )}
    </>
  );
};

export default MainLayout;
