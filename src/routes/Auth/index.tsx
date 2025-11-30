import Login from './Login';
import Register from './Register';
import AvatarSelection from './AvatarSelection';

const AuthRoutes = [
  {
    path: 'login',
    element: <Login />,
    handle: { headerVariant: 'simple', footer: false },
  },
  {
    path: 'sign-up',
    element: <Register />,
    handle: { headerVariant: 'simple', footer: false },
  },
  {
    path: 'avatar-selection',
    element: <AvatarSelection />,
    handle: { headerVariant: 'simple', footer: false },
  },
];

export default AuthRoutes;
