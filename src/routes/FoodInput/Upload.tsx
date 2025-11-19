import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import {
  Camera,
  RotateCcw,
  Upload as UploadIcon,
  AlertCircle,
  Check,
} from 'lucide-react';
type UploadProps = {
  onUpload?: (file: Blob) => Promise<void>;
};
const Upload: React.FC<UploadProps> = ({ onUpload }) => {
  const [img, setImg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImg(imageSrc);
      setIsCapturing(false);
      setError(null);
    }
  }, []);

  const uploadImage = useCallback(async () => {
    if (!img) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(img);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, `photo-${Date.now()}.jpg`);

      const uploadUrl = import.meta.env.VITE_UPLOAD_API_URL;
      if (!uploadUrl) {
        // In a real app, you might want to handle this more gracefully
        // or ensure the env var is always set during the build process.
        console.error('Upload API URL is not configured. Please set VITE_UPLOAD_API_URL in your .env file.');
        throw new Error('上傳失敗: API URL 未配置');
      }
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`上傳失敗: ${uploadResponse.statusText}`);
      }

      const result = await uploadResponse.json();
      console.log('上傳成功:', result);

      if (onUpload) {
        await onUpload(blob);
      }

      setSuccess(true);
      setTimeout(() => {
        setImg(null);
        setIsCapturing(true);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '上傳失敗';
      setError(errorMessage);
      console.error('上傳失敗:', err);
    } finally {
      setIsUploading(false);
    }
  }, [img, onUpload]);

  const retake = useCallback(() => {
    setImg(null);
    setIsCapturing(true);
    setError(null);
  }, []);

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'environment' as const,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">拍照上傳</h1>
          <p className="text-slate-400">捕捉照片並上傳到伺服器</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {isCapturing ? (
            <>
              <div className="relative bg-black">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm font-medium">
                  請直對鏡頭
                </div>
              </div>

              <div className="p-6 flex gap-3">
                <button
                  onClick={capture}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Camera size={20} />
                  拍照
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-200">
                {img && (
                  <img
                    src={img}
                    alt="Captured"
                    className="w-full h-96 object-cover"
                  />
                )}
              </div>

              {success && (
                <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <Check size={20} className="text-green-600" />
                  <span className="text-green-700 font-medium text-sm">
                    上傳成功！
                  </span>
                </div>
              )}

              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle
                    size={20}
                    className="text-red-600 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-red-700 font-medium text-sm">
                    {error}
                  </span>
                </div>
              )}

              <div className="p-6 flex gap-3">
                <button
                  onClick={uploadImage}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  <UploadIcon size={20} />
                  {isUploading ? '上傳中...' : '上傳'}
                </button>

                <button
                  onClick={retake}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={20} />
                  重拍
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6 text-slate-400 text-sm">
          <p>⚠️ 需要 HTTPS 連接以訪問相機</p>
        </div>
      </div>
    </div>
  );
};

export default Upload;
