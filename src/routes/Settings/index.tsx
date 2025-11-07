import Notifications from './Notifications';
import Profile from './Profile';
import Subscription from './Subscription';

const SettingsRoutes = [
  {
    path: 'Notifications',
    element: <Notifications />,
    handle: { headerVariant: 'simple', footer: false },
  },
  {
    path: 'Profile',
    element: <Profile />,
    handle: { headerVariant: 'simple', footer: false },
  },
  {
    path: 'Subscription',
    element: <Subscription />,
    handle: { headerVariant: 'simple', footer: false },
  },
];

export default SettingsRoutes;
