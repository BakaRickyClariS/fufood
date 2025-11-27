import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/shared/components/layout/MainLayout';
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import Recipe from './Recipe';
import FoodInputRoutes from './FoodInput';
import AuthRoutes from './Auth';
import SettingsRoutes from './Settings';
import CategoryPage from './Inventory/CategoryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      ...AuthRoutes,
      {
        path: 'inventory',
        children: [
          { index: true, element: <Inventory /> },
          { path: 'category/:categoryId', element: <CategoryPage /> },
        ],
      },
      { path: 'recipe', element: <Recipe /> },
      ...FoodInputRoutes,
      ...SettingsRoutes,
    ],
  },
]);
