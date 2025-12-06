import React from 'react';
import { Image as ImageIcon, X, Check, Camera } from 'lucide-react';

export type CameraOverlayStatus =
  | 'capturing'
  | 'uploading'
  | 'analyzing'
  | 'done'
  | 'error';

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
  onCapture,
  onRetake,
  onGallerySelect,
  onConfirm,
  onClose,
  errorMessage,
}) => {
  const isCapturing = status === 'capturing';
  const isProcessing = status === 'uploading' || status === 'analyzing';

  return (
    <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
      {/* Top Status Toast */}
      <div className="pt-10 flex justify-center pointer-events-auto">
        {isCapturing ? (
          <div className="bg-yellow-400/90 text-black px-6 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-sm">
            請將食材放入框內
          </div>
        ) : (
          <div
            className={`
            px-6 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-sm text-white
            ${status === 'error' ? 'bg-red-500/90' : 'bg-green-500/90'}
          `}
          >
            {status === 'uploading' && '上傳處理中...'}
            {status === 'analyzing' && 'AI 辨識中...'}
            {status === 'done' && '掃描完成'}
            {status === 'error' && (errorMessage || '掃描失敗')}
            {!isProcessing &&
              status !== 'done' &&
              status !== 'error' &&
              '沒問題，掃描即將完成'}
          </div>
        )}
      </div>

      {/* Spacer - Push buttons to bottom */}
      <div className="flex-1" />

      {/* Bottom Button Area */}
      <div className="pb-12 px-8 flex items-center justify-between pointer-events-auto">
        {/* Left Button: Gallery (only in capture mode) */}
        {isCapturing ? (
          <button
            onClick={onGallerySelect}
            disabled={isProcessing}
            className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-slate-700 hover:bg-white transition-all disabled:opacity-50"
          >
            <ImageIcon size={24} />
          </button>
        ) : (
          <div className="w-14" /> // Spacer for alignment
        )}

        {/* Center Button: Capture or Confirm/Retake */}
        {isCapturing ? (
          // Capturing Mode: Show Capture Button (FAB Style)
          <button
            onClick={onCapture}
            disabled={isProcessing}
            className="w-20 h-20 rounded-full flex items-center justify-center text-black border-4 border-primary-200 bg-fab-gradient transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            <Camera className="w-6 h-6" />
          </button>
        ) : (
          // Preview Mode: Show Retake and Confirm Buttons
          <div className="flex gap-6 items-center">
            <button
              onClick={onRetake}
              disabled={isProcessing}
              className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <X size={24} strokeWidth={3} />
            </button>
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

        {/* Right Button: Close (only in capture mode) */}
        {isCapturing ? (
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-slate-700 hover:bg-white transition-all disabled:opacity-50"
          >
            <X size={24} />
          </button>
        ) : (
          <div className="w-14" /> // Spacer for alignment
        )}
      </div>
    </div>
  );
};

export default CameraOverlay;
