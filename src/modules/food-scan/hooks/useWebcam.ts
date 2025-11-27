import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

export const useWebcam = () => {
  const webcamRef = useRef<Webcam>(null);
  const [img, setImg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImg(imageSrc);
      setIsCapturing(false);
    }
  }, []);

  const retake = useCallback(() => {
    setImg(null);
    setIsCapturing(true);
  }, []);

  const setExternalImage = useCallback((imageSrc: string) => {
    setImg(imageSrc);
    setIsCapturing(false);
  }, []);

  return {
    webcamRef,
    img,
    isCapturing,
    capture,
    retake,
    setExternalImage,
  };
};
