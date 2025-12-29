import InviteAcceptPage from './InviteAcceptPage';

/**
 * 邀請相關路由
 * 這些路由是公開的，不需要登入即可查看邀請資訊
 */
const InviteRoutes = [
  {
    path: 'invite/:token',
    element: <InviteAcceptPage />,
  },
];

export default InviteRoutes;
