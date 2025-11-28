import Upload from './Upload';
import ScanResult from './ScanResult';

const FoodInputRoutes = [
  {
    path: 'upload',
    element: <Upload />,
    handle: { headerVariant: 'simple', footer: false },
  },
  {
    path: 'upload/scan-result',
    element: <ScanResult />,
    handle: { headerVariant: 'simple', footer: false },
  },
];

export default FoodInputRoutes;
