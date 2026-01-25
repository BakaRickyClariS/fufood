import NotificationsPage from './NotificationsPage';
import NotificationDetailPage from './NotificationDetailPage';

const NotificationsRoutes = [
  {
    path: 'notifications',
    element: <NotificationsPage />,
    handle: { headerVariant: 'default', footer: true }, // Show TopNav and BottomNav
  },
  {
    path: 'notifications/:id',
    element: <NotificationDetailPage />,
    handle: { headerVariant: 'hidden', footer: false }, // Hide TopNav and BottomNav for detail page
  },
];

export default NotificationsRoutes;
