import Notifications from './Notifications';
import Profile from './Profile';
import Subscription from './Subscription';

const SettingsRoutes = [
  {
    path: 'notifications',
    element: <Notifications />,
    handle: { headerVariant: 'simple', footer: false },
  },
  {
    path: 'profile',
    element: <Profile />,
    handle: { headerVariant: 'simple', footer: false },
  },
  {
    path: 'subscription',
    element: <Subscription />,
    handle: { headerVariant: 'simple', footer: false },
  },
];

export default SettingsRoutes;
