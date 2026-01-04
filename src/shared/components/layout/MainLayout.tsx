import { useEffect, useMemo } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import { GroupModalProvider } from '@/modules/groups/providers/GroupModalProvider';
import { ThemeProvider } from '@/shared/providers/ThemeProvider';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

type RouteHandle = {
  headerVariant?: 'default' | 'simple' | 'none';
  footer?: boolean;
  bodyClass?: string;
};

// Custom Hook to extract route configuration
const useRouteConfig = () => {
  const matches = useMatches();

  return useMemo(() => {
    // Get the last matching route that has a handle
    const handle = matches
      .filter((match) => match.handle)
      .map((match) => match.handle as RouteHandle)
      .pop();

    return {
      showHeader:
        handle?.headerVariant !== 'none' && handle?.headerVariant !== 'simple',
      showFooter: handle?.footer !== false,
      bodyClass: handle?.bodyClass || '',
    };
  }, [matches]);
};

const MainLayout = () => {
  const { showHeader, showFooter, bodyClass } = useRouteConfig();

  // Apply body class
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
    <ThemeProvider>
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
    </ThemeProvider>
  );
};

export default MainLayout;
