import { router } from '../../Router';
import { RouterProvider } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { SWPrompt } from '../feedback/SWPrompt';
import { useState } from 'react';
const AppContainer: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);

  const updateSW = registerSW({
    onNeedRefresh() {
      setNeedRefresh(true);
    },
  });

  return (
    <>
      <RouterProvider router={router} />
      <SWPrompt
        show={needRefresh}
        onUpdate={() => {
          updateSW();
          setNeedRefresh(false);
        }}
        onClose={() => setNeedRefresh(false)}
      />
    </>
  );
};

export default AppContainer;
