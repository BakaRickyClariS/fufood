import { router } from '@/routes';
import { RouterProvider } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { SWPrompt } from '@/shared/components/feedback/SWPrompt';
import { useEffect, useRef, useState } from 'react';
import { SplashScreen } from '@/shared/components/SplashScreen';
import { gsap } from 'gsap';

const App: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const splashRef = useRef<HTMLDivElement>(null);
  
  const updateSW =
    useRef<(reloadPage?: boolean) => Promise<void> | void>(undefined);

  useEffect(() => {
    updateSW.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });

    // 載入畫面控制
    const timer = setTimeout(() => {
      if (splashRef.current) {
        gsap.to(splashRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            setShowSplash(false);
          }
        });
      }
    }, 2000); // 顯示至少 2 秒

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && (
        <div ref={splashRef}>
          <SplashScreen />
        </div>
      )}
      
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
