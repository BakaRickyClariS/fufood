import { router } from '@/routes';
import { RouterProvider } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { SWPrompt } from '@/shared/components/feedback/SWPrompt';
import { useEffect, useRef, useState } from 'react';

const App: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSW =
    useRef<(reloadPage?: boolean) => Promise<void> | void>(undefined);

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

export default App;
