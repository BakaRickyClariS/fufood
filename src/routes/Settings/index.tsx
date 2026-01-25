import Notifications from './Notifications';
import SettingsPage from './SettingsPage';

const SettingsRoutes = [
  {
    path: 'settings',
    children: [
      {
        index: true,
        element: <SettingsPage />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
        handle: { headerVariant: 'simple', footer: true },
      },
    ],
  },
];

export default SettingsRoutes;
