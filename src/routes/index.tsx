import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/shared/components/layout/MainLayout';
import StartPage from './Start';
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import Recipe from './Recipe';
import FoodInputRoutes from './FoodInput';
import AuthRoutes from './Auth';
import SettingsRoutes from './Settings';
import CategoryPage from './Inventory/CategoryPage';
import GroupSettings from './Group/Settings';
import GroupMembers from './Group/Members';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/start" replace />;
  }
  return <>{children}</>;
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
        ) 
      },
      { path: 'start', element: <StartPage /> },
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
      {
        path: 'group',
        children: [
          { path: 'settings', element: <GroupSettings /> },
          { path: 'members', element: <GroupMembers /> },
        ],
      },
      { path: 'recipe', element: <Recipe /> },
      ...FoodInputRoutes,
      ...SettingsRoutes,
    ],
  },
]);
