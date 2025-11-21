import { router } from '../../Router';
import { RouterProvider } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { SWPrompt } from '../feedback/SWPrompt';
import { useEffect, useRef, useState } from 'react';
const AppContainer: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSW = useRef<(reloadPage?: boolean) => Promise<void> | void>(undefined);
  useEffect(() => {
    updateSW.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <SWPrompt
        show={needRefresh}
        onUpdate={() => {
          updateSW.current?.();
        }}
        onClose={() => setNeedRefresh(false)}
      />
    </>
  );
};

export default AppContainer;
