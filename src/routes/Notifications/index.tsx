import NotificationsPage from './NotificationsPage';

const NotificationsRoutes = [
  {
    path: 'notifications',
    element: <NotificationsPage />,
    handle: { headerVariant: 'default', footer: true }, // Show TopNav and BottomNav
  },
];

export default NotificationsRoutes;
