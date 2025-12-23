import { useEffect } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import { GroupModalProvider } from '@/modules/groups/providers/GroupModalProvider';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

type RouteHandle = {
  headerVariant?: 'default' | 'simple' | 'none';
  footer?: boolean;
  bodyClass?: string;
};

const MainLayout = () => {
  const matches = useMatches();

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
  const bodyClass = currentHandle?.bodyClass || '';

  useEffect(() => {
    if (bodyClass) {
      document.body.classList.add(bodyClass);
    }

    return () => {
      if (bodyClass) {
        document.body.classList.remove(bodyClass);
      }
    };
  }, [bodyClass]);

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
