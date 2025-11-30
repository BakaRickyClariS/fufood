import React, { createContext, useContext, type ReactNode } from 'react';

type CameraContextType = {
  triggerCapture: () => void;
};

const CameraContext = createContext<CameraContextType | null>(null);

type CameraProviderProps = {
  children: ReactNode;
  onCapture: () => void;
};

export const CameraProvider: React.FC<CameraProviderProps> = ({ 
  children, 
  onCapture 
}) => {
  const triggerCapture = () => {
    onCapture();
  };

  return (
    <CameraContext.Provider value={{ triggerCapture }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCameraControl = () => {
  return useContext(CameraContext);
};
