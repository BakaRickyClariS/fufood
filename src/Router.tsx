import { createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './routes/Dashboard';
import AuthRoutes from './routes/Auth';
import Inventory from './routes/Inventory';
import Recipe from './routes/Recipe';
import SettingsRoutes from './routes/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      ...AuthRoutes,
      { path: 'inventory', element: <Inventory /> },
      { path: 'recipe', element: <Recipe /> },
      ...SettingsRoutes,
    ],
  },
]);
