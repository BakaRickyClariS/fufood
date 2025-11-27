import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import CameraOverlay from '@/modules/food-scan/components/CameraOverlay';
import InstructionsModal from '@/modules/food-scan/components/InstructionsModal';
import { useWebcam } from '@/modules/food-scan/hooks/useWebcam';
import { useImageUpload } from '@/modules/food-scan/hooks/useImageUpload';

type UploadProps = {
  onUpload?: (file: Blob) => Promise<void>;
};

const INSTRUCTIONS_KEY = 'fufood_upload_instructions_seen';

const Upload: React.FC<UploadProps> = ({ onUpload }) => {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { webcamRef, img, isCapturing, capture, retake, setExternalImage } =
    useWebcam();

  const { isUploading, isAnalyzing, uploadImage } = useImageUpload({
    onUploadSuccess: onUpload,
    onAnalyzeSuccess: (result, imageUrl) => {
      navigate('scan-result', {
        state: { result, imageUrl },
      });
    },
  });

  useEffect(() => {
    const seen = localStorage.getItem(INSTRUCTIONS_KEY);
    if (!seen) {
      setShowInstructions(true);
    }
  }, []);

  const handleCloseInstructions = () => {
    if (dontShowAgain) {
      localStorage.setItem(INSTRUCTIONS_KEY, 'true');
    }
    setShowInstructions(false);
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExternalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (img) {
      uploadImage(img);
    }
  };

  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: 'environment' as const,
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black overflow-hidden overscroll-none touch-none flex flex-col">
      {/* Camera Layer */}
      <div className="absolute inset-0 z-0">
        {isCapturing ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="h-full w-full object-cover"
          />
        ) : (
          img && (
            <img
              src={img}
              alt="Captured"
              className="h-full w-full object-cover"
            />
          )
        )}
      </div>

      {/* Overlays */}
      <CameraOverlay
        isCapturing={isCapturing}
        isUploading={isUploading}
        isAnalyzing={isAnalyzing}
        onGalleryClick={handleGalleryClick}
        onCapture={capture}
        onRetake={retake}
        onUpload={handleUpload}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
      />

      {/* Instructions Modal */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={handleCloseInstructions}
        dontShowAgain={dontShowAgain}
        onDontShowAgainChange={setDontShowAgain}
      />
    </div>
  );
};

export default Upload;
