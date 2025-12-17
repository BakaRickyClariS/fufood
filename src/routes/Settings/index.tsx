import EditProfile from './EditProfile';
import EditDietaryPreference from './EditDietaryPreference';
import Subscription from './Subscription';
import PurchaseHistory from './PurchaseHistory';
import Notifications from './Notifications';
import HelpCenter from './HelpCenter';
import ReportProblem from './ReportProblem';
import AppGuide from './AppGuide';
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
        path: 'profile',
        element: <EditProfile />,
        handle: { headerVariant: 'simple', footer: true },
      },
      {
        path: 'dietary-preference',
        element: <EditDietaryPreference />,
        handle: { headerVariant: 'simple', footer: true },
      },
      {
        path: 'subscription',
        element: <Subscription />,
        handle: { headerVariant: 'simple', footer: true },
      },
      {
        path: 'purchase-history',
        element: <PurchaseHistory />,
        handle: { headerVariant: 'simple', footer: true },
      },
      {
        path: 'notifications',
        element: <Notifications />,
        handle: { headerVariant: 'simple', footer: true },
      },
      {
        path: 'help',
        element: <HelpCenter />,
        handle: { headerVariant: 'simple', footer: true },
      },
      {
        path: 'report',
        element: <ReportProblem />,
        handle: { headerVariant: 'simple', footer: true },
      },
      {
        path: 'guide',
        element: <AppGuide />,
        handle: { headerVariant: 'simple', footer: true },
      },
    ],
  },
];

export default SettingsRoutes;
