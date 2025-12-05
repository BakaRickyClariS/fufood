import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import Webcam from 'react-webcam';
import { useDispatch } from 'react-redux';
import gsap from 'gsap';
import { useWebcam } from '../../hooks/useWebcam';
import { useImageUpload } from '../../hooks/useImageUpload';
import CameraOverlay, { type CameraOverlayStatus } from '../ui/CameraOverlay';
import { useNavigate } from 'react-router-dom';
import { setCapturedImage, retake as retakeAction, setUploadStatus } from '@/modules/food-scan/store/cameraSlice';
import { useToast } from '@/shared/contexts/ToastContext';
import { ScanFrame } from '../ui/ScanFrame';

// Test image import
import testImage from '@/assets/test/carrot.jpg';

const videoConstraints: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
  // 移除 min 限制，避免在不支援高解析度的設備上發生 OverconstrainedError
  width: { ideal: 1080 },
  height: { ideal: 1920 },
  // 移除強制長寬比，讓瀏覽器自動適應
  // aspectRatio: 9 / 16, 
};

export const CameraCapture: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [scanError, setScanError] = useState<string | null>(null);
  
  const { webcamRef, img, isCapturing, capture: originalCapture, retake: originalRetake, setExternalImage } = useWebcam();
  
  const capture = () => {
    setScanError(null);
    originalCapture();
  };

  const retake = () => {
    setScanError(null);
    originalRetake();
  };
  const { uploadImage, isUploading, isAnalyzing } = useImageUpload({});
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GSAP Navigation Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Entry animation: Slide out
      gsap.to('.top-nav-wrapper', { 
        yPercent: -100, 
        duration: 0.5, 
        ease: 'power3.inOut' 
      });
      gsap.to('.bottom-nav-wrapper', { 
        yPercent: 120, 
        duration: 0.5, 
        ease: 'power3.inOut' 
      });
    });

    return () => {
      // Exit animation: Slide in (cleanup)
      // We use gsap.to to animate them back when unmounting
      gsap.to('.top-nav-wrapper', { 
        yPercent: 0, 
        duration: 0.5, 
        ease: 'power3.inOut',
        overwrite: true 
      });
      gsap.to('.bottom-nav-wrapper', { 
        yPercent: 0, 
        duration: 0.5, 
        ease: 'power3.inOut',
        overwrite: true
      });
      ctx.revert(); // Cleanup context
    };
  }, []);

  // Listen for trigger token changes from Redux (BottomNav FAB button)
  // Removed triggerToken logic

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
      setScanError(null); // Clear previous error
      try {
        const result = await uploadImage(img);
        if (result) {
           showToast('掃描成功！', 'success');
           navigate('/upload/scan-result', { state: { result: result.data, imageUrl: img } });
        } else {
           const msg = '掃描失敗，請重試';
           setScanError(msg);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '掃描失敗，請重試';
        setScanError(message);
      }
    }
  };

  const getStatus = (): CameraOverlayStatus => {
    if (scanError) return 'error';
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
          onUserMediaError={(e) => {
            console.error('Webcam error', e);
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

      <ScanFrame />

      <CameraOverlay
        status={getStatus()}
        onCapture={capture}
        onRetake={retake}
        onGallerySelect={handleGallerySelect}
        onConfirm={handleConfirm}
        onClose={() => navigate('/')}
        errorMessage={scanError || undefined}
      />
    </div>
  );
};
