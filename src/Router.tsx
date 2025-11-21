import { createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './routes/Dashboard';
import Inventory from './routes/Inventory';
import Recipe from './routes/Recipe';
import FoodInputRoutes from './routes/FoodInput';
import AuthRoutes from './routes/Auth';
import SettingsRoutes from './routes/Settings';
import CategoryPage from './routes/Inventory/CategoryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
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
