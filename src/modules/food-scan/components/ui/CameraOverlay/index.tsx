import React from 'react';
import { Image as ImageIcon, X, Check } from 'lucide-react';

export type CameraOverlayStatus = 'capturing' | 'uploading' | 'analyzing' | 'done' | 'error';

type CameraOverlayProps = {
  status: CameraOverlayStatus;
  onCapture: () => void;
  onRetake: () => void;
  onGallerySelect: () => void;
  onConfirm: () => void;
  onClose: () => void;
  errorMessage?: string;
};

const CameraOverlay: React.FC<CameraOverlayProps> = ({
  status,
  onCapture: _onCapture,
  onRetake,
  onGallerySelect,
  onConfirm,
  onClose,
  errorMessage,
}) => {
  const isCapturing = status === 'capturing';
  const isProcessing = status === 'uploading' || status === 'analyzing';

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Top Status - Only show when not capturing (i.e. in preview or processing) */}
      {!isCapturing && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20">
          <div className={`
            px-6 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-sm text-white
            ${status === 'error' ? 'bg-red-500/90' : 'bg-green-500/90'}
          `}>
            {status === 'uploading' && '上傳處理中...'}
            {status === 'analyzing' && 'AI 辨識中...'}
            {status === 'done' && '掃描完成'}
            {status === 'error' && (errorMessage || '掃描失敗')}
            {/* If just previewing (not processing yet), show success message */}
            {!isProcessing && status !== 'done' && status !== 'error' && '沒問題，掃描即將完成'}
          </div>
        </div>
      )}

      {/* Top Status for Capturing - Yellow Pill */}
      {isCapturing && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-yellow-400/90 text-black px-6 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-sm">
            請將食材放入框內
          </div>
        </div>
      )}

      {/* Left Bottom: Gallery Button */}
      <button
        onClick={onGallerySelect}
        disabled={isProcessing}
        className="absolute bottom-24 left-8 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        <ImageIcon size={24} />
      </button>

      {/* Right Bottom: Close Button - Only show in Capture mode (to exit) */}
      {isCapturing && (
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute bottom-24 right-8 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <X size={24} />
        </button>
      )}

      {/* Bottom Center: Capture or Confirm Actions */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-auto z-50">
        {!isCapturing && (
          <div className="flex gap-6 items-center">
            {/* Retake Button (X) */}
            <button
              onClick={onRetake}
              disabled={isProcessing}
              className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <X size={24} strokeWidth={3} />
            </button>

            {/* Confirm Button */}
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl text-slate-700 hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-8 h-8 border-4 border-neutral-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={24} strokeWidth={3} />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraOverlay;
