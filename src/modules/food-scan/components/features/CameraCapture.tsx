import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { useWebcam } from '../../hooks/useWebcam';
import { useImageUpload } from '../../hooks/useImageUpload';
import CameraOverlay, { type CameraOverlayStatus } from '../ui/CameraOverlay';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { setCapturedImage, retake as retakeAction, setUploadStatus } from '@/modules/food-scan/store/cameraSlice';

// Test image import
import testImage from '@/assets/test/carrot.jpg';

const videoConstraints: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
  // 以直向 9:16 為主，請求較高解析度以避免放大後模糊
  width: { min: 720, ideal: 1080, max: 1920 },
  height: { min: 1280, ideal: 1920, max: 2560 },
  aspectRatio: 9 / 16,
};

export const CameraCapture: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { triggerToken } = useSelector((state: RootState) => state.camera);
  const [isReady, setIsReady] = useState(false);
  
  const { webcamRef, img, isCapturing, capture, retake, setExternalImage } = useWebcam();
  const { uploadImage, isUploading, isAnalyzing, error } = useImageUpload({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevTriggerToken = useRef(triggerToken);
  const pendingTriggerRef = useRef(false);

  // Listen for trigger token changes from Redux (BottomNav FAB button)
  useEffect(() => {
    if (triggerToken > prevTriggerToken.current) {
      if (isReady) {
        capture();
        pendingTriggerRef.current = false;
      } else {
        // 相機尚未就緒，先記錄待觸發
        pendingTriggerRef.current = true;
      }
      prevTriggerToken.current = triggerToken;
    }
  }, [triggerToken, capture, isReady]);

  // 相機就緒後若有待觸發請求，立即拍一次
  useEffect(() => {
    if (isReady && pendingTriggerRef.current) {
      capture();
      pendingTriggerRef.current = false;
    }
  }, [isReady, capture]);

  // Sync local state to Redux when image captured
  useEffect(() => {
    if (img) {
      dispatch(setCapturedImage(img));
    } else {
      dispatch(retakeAction());
    }
  }, [img, dispatch]);

  // Sync upload status to Redux
  useEffect(() => {
    if (isUploading) dispatch(setUploadStatus('uploading'));
    else if (isAnalyzing) dispatch(setUploadStatus('analyzing'));
    else if (img) dispatch(setUploadStatus('done'));
    else dispatch(setUploadStatus('capturing'));
  }, [isUploading, isAnalyzing, img, dispatch]);

  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setExternalImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadTestImage = async () => {
    try {
      const response = await fetch(testImage);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setExternalImage(base64);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Failed to load test image:', error);
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
    <div className="relative w-full h-full bg-black">
      {isCapturing ? (
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.92}
          videoConstraints={videoConstraints}
          forceScreenshotSourceSize
          playsInline
          onUserMedia={() => setIsReady(true)}
          onUserMediaError={(e) => {
            console.error('Webcam error', e);
            setIsReady(false);
          }}
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

      {/* Dev Only: Test Image Button */}
      {import.meta.env.DEV && isCapturing && (
        <button
          onClick={handleLoadTestImage}
          className="absolute top-24 right-4 z-50 bg-blue-500 text-white px-3 py-1 rounded text-xs opacity-70 hover:opacity-100"
        >
          載入測試圖片
        </button>
      )}

      <CameraOverlay
        status={getStatus()}
        onCapture={capture}
        onRetake={retake}
        onGallerySelect={handleGallerySelect}
        onConfirm={handleConfirm}
        onClose={() => navigate(-1)}
      />
    </div>
  );
};
