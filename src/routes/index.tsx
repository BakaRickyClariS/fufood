import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/shared/components/layout/MainLayout';
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import Recipe from './Recipe';
import FoodScanRoutes from './FoodScan';
import AuthRoutes from './Auth';
import SettingsRoutes from './Settings';
import CategoryPage from './Inventory/CategoryPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      { path: 'dashboard', element: <Dashboard /> },
      {
        path: 'auth',
        children: AuthRoutes,
      },
      {
        path: 'inventory',
        children: [
          { index: true, element: <Inventory /> },
          { path: 'category/:categoryId', element: <CategoryPage /> },
        ],
      },

      { path: 'recipe', element: <Recipe /> },
      ...FoodScanRoutes,
      ...SettingsRoutes,
    ],
  },
]);
