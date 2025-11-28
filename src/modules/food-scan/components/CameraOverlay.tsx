import React from 'react';
import { Image as ImageIcon, X, Check } from 'lucide-react';

type CameraOverlayProps = {
  isCapturing: boolean;
  isUploading: boolean;
  isAnalyzing: boolean;
  onGalleryClick: () => void;
  onCapture: () => void;
  onRetake: () => void;
  onUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const CameraOverlay: React.FC<CameraOverlayProps> = ({
  isCapturing,
  isUploading,
  isAnalyzing,
  onGalleryClick,
  onCapture,
  onRetake,
  onUpload,
  fileInputRef,
  onFileChange,
}) => (
  <div className="relative z-10 flex-1 flex flex-col p-6 mt-20 pointer-events-none">
    {/* Top Status Pill */}
    <div className="absolute top-3 left-0 right-0 flex justify-center z-20">
      <div className="bg-yellow-400/90 text-black px-6 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-sm">
        {isCapturing
          ? '請將食材放入框內'
          : isUploading
            ? '上傳處理中...'
            : isAnalyzing
              ? 'AI 辨識中...'
              : '掃描完成'}
      </div>
    </div>

    {/* Center Group: Frame + Controls */}
    <div className="flex-1 flex flex-col items-center justify-center -mt-15 w-full">
      {/* Scanning Frame */}
      <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
        {/* Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-3xl -mt-1 -ml-1" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-3xl -mt-1 -mr-1" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-3xl -mb-1 -ml-1" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-3xl -mb-1 -mr-1" />
      </div>

      {/* Bottom Controls - 12px (mt-3) below frame */}
      <div className="mt-8 flex items-center justify-center gap-8 pointer-events-auto">
        {/* Gallery Button */}
        <button
          onClick={onGalleryClick}
          className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
        >
          <ImageIcon size={24} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Capture/Action Button */}
        {isCapturing ? (
          <button
            onClick={onCapture}
            className="w-20 h-20 bg-white rounded-full p-1.5 shadow-xl transition-transform active:scale-95"
          >
            <div className="w-full h-full rounded-full border-4 border-black/10 bg-red-500" />
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={onRetake}
              className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <X size={24} />
            </button>
            <button
              onClick={onUpload}
              disabled={isUploading || isAnalyzing}
              className="w-20 h-20 bg-white rounded-full p-1.5 shadow-xl transition-transform active:scale-95 flex items-center justify-center"
            >
              {isUploading || isAnalyzing ? (
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={40} className="text-red-500" />
              )}
            </button>
          </div>
        )}

        {/* Balance spacer for Gallery button if needed, but centering gap-8 works well */}
        <div className="w-12" />
      </div>
    </div>
  </div>
);

export default CameraOverlay;
