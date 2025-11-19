import Upload from './Upload';

const FoodInputRoutes = [
  {
    path: 'upload',
    element: <Upload />,
    handle: { headerVariant: 'simple', footer: false },
  },
];

export default FoodInputRoutes;
