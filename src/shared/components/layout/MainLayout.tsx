import { Outlet, useLocation, useMatches } from 'react-router-dom';
import { useEffect } from 'react';
import { GroupModalProvider } from '@/modules/groups/providers/GroupModalProvider';
// import { mockGroups } from '@/modules/groups/mocks/mockData';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

type RouteHandle = {
  headerVariant?: 'default' | 'simple' | 'none';
  footer?: boolean;
};

const MainLayout = () => {
  const location = useLocation();
  const matches = useMatches();
  const isDashboard =
    location.pathname === '/' || location.pathname === '/dashboard';

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

  // 暫時使用 Mock 的第一個群組作為當前群組
  // const currentGroup = mockGroups[0]; // Provider internal state now handles this

  return (
    <GroupModalProvider>
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
    </GroupModalProvider>
  );
};

export default MainLayout;
