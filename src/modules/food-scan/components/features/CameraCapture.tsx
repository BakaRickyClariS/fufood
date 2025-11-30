import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import { useWebcam } from '../../hooks/useWebcam';
import { useImageUpload } from '../../hooks/useImageUpload';
import CameraOverlay, {type CameraOverlayStatus } from '../ui/CameraOverlay';
import { useNavigate } from 'react-router-dom';

const videoConstraints = {
  facingMode: 'environment',
  aspectRatio: 9 / 16, // Full screen mobile ratio
};

import { CameraProvider } from '../../contexts/CameraContext';

export const CameraCapture: React.FC = () => {
  const navigate = useNavigate();
  const { webcamRef, img, isCapturing, capture, retake, setExternalImage } = useWebcam();
  const { uploadImage, isUploading, isAnalyzing } = useImageUpload({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    capture();
    // capture() in useWebcam updates the 'img' state asynchronously.
    // We don't need to do anything else here, the UI will update based on 'img' presence.
  };

  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Set the image to trigger preview mode (not upload yet)
        setExternalImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    if (img) {
      const result = await uploadImage(img);
      if (result) {
        navigate('/upload/scan-result', { state: { result: result.data, imageUrl: img } });
      } else {
        console.error('上傳或分析失敗');
        // TODO: Add toast notification here
      }
    }
  };

  const getStatus = (): CameraOverlayStatus => {
    if (isUploading) return 'uploading';
    if (isAnalyzing) return 'analyzing';
    if (isCapturing) return 'capturing';
    return 'done';
  };

  return (
    <CameraProvider onCapture={handleCapture}>
      <div className="relative w-full h-full bg-black">
        {isCapturing ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          img && (
            <img
              src={img}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <CameraOverlay
          status={getStatus()}
          onCapture={capture}
          onRetake={retake}
          onGallerySelect={handleGallerySelect}
          onConfirm={handleConfirm}
          onClose={() => navigate(-1)}
        />
      </div>
    </CameraProvider>
  );
};
