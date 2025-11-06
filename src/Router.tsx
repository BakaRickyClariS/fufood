import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      // children: [
      //   { index: true, element: <Home /> },
      //   {
      //     path: 'login',
      //     element: <Login />,
      //     handle: { headerVariant: 'simple', footer: false },
      //   },
      //   {
      //     path: 'sign-up',
      //     element: <Signup />,
      //     handle: { headerVariant: 'simple', footer: false },
      //   },
      // ],
    },
  ],
  {
    basename: '/fufood/', // ← 設定前綴
  },
);
