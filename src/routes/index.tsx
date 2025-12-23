import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/shared/components/layout/MainLayout';
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import PlanningRoutes from './Planning';
import FoodScanRoutes from './FoodScan';
import AuthRoutes from './Auth';
import SettingsRoutes from './Settings';
import NotificationsRoutes from './Notifications';
import CategoryPage from './Inventory/CategoryPage';

import { useAuth } from '@/modules/auth';

/**
 * 受保護路由元件
 * 檢查用戶是否已登入，未登入則重定向到登入頁面
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return null;

  // 無 token 或 token 已過期
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

/**
 * 包裝路由陣列，為每個路由的 element 加上 ProtectedRoute
 * 使用 eslint-disable 來避免 any 類型警告，因為 react-router 的 RouteObject 類型較為複雜
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrapRoutesWithProtection = (routes: any[]): any[] => {
  return routes.map((route) => {
    const wrappedRoute = { ...route };

    if (route.element) {
      wrappedRoute.element = <ProtectedRoute>{route.element}</ProtectedRoute>;
    }

    if (route.children) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      wrappedRoute.children = route.children.map((child: any) => ({
        ...child,
        element: child.element ? (
          <ProtectedRoute>{child.element}</ProtectedRoute>
        ) : (
          child.element
        ),
      }));
    }

    return wrappedRoute;
  });
};

type RouteHandle = {
  headerVariant?: 'default' | 'simple' | 'none';
  footer?: boolean;
  bodyClass?: string;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        handle: { bodyClass: 'body-dashboard-bg' } as RouteHandle,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        handle: { bodyClass: 'body-dashboard-bg' } as RouteHandle,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'auth',
        children: AuthRoutes, // 認證相關路由保持公開
      },
      {
        path: 'inventory',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            ),
          },
          {
            path: 'category/:categoryId',
            element: (
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            ),
          },
        ],
      },

      ...wrapRoutesWithProtection(PlanningRoutes),
      ...wrapRoutesWithProtection(FoodScanRoutes),
      ...wrapRoutesWithProtection(SettingsRoutes),
      ...wrapRoutesWithProtection(NotificationsRoutes),
    ],
  },
]);
