import Upload from './Upload';

const FoodScanRoutes = [
  {
    path: 'upload',
    element: <Upload />,
    handle: { headerVariant: 'simple', footer: false },
  },
];

export default FoodScanRoutes;
