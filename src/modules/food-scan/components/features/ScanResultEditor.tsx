import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScanResultEditForm from '../forms/ScanResultEditForm';
import { type FoodItemInput } from '../../types';

type ScanResultEditorProps = {
  initialData: FoodItemInput;
  imageUrl?: string;
  onSave: (data: FoodItemInput) => void;
  onBack: () => void;
  onRetake?: () => void;
  onPickImage?: () => void;
  currentIndex?: number;
  totalCount?: number;
};

export const ScanResultEditor: React.FC<ScanResultEditorProps> = ({
  initialData,
  imageUrl,
  onSave,
  onBack,
  onRetake,
  onPickImage,
  currentIndex,
  totalCount,
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FoodItemInput>({
    defaultValues: initialData,
  });

  // Reset form when initialData changes (important for batch mode)
  useEffect(() => {
    console.log(
      'ScanResultEditor: resetting form with initialData:',
      initialData,
    );
    reset(initialData);
  }, [initialData, reset]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      // 進入編輯模式的進場動畫，改為從右側滑入以符合系統規範
      if (containerRef.current) {
        gsap.from(containerRef.current, {
          x: '100%',
          opacity: 0,
          duration: 0.3,
          ease: 'power3.out',
        });
      }
    },
    { scope: containerRef },
  );

  const handleBackAnim = contextSafe(() => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        x: '100%',
        duration: 0.25,
        ease: 'power3.in',
        onComplete: onBack,
      });
    } else {
      onBack();
    }
  });

  // Save with animation
  const onSubmit = contextSafe((data: FoodItemInput) => {
    // Merge form data with initialData to preserve fields like groupId and imageUrl
    const savedData: FoodItemInput = {
      ...initialData,
      ...data,
      groupId: initialData.groupId,
      imageUrl: initialData.imageUrl,
    };

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        x: '100%',
        duration: 0.25,
        ease: 'power3.in',
        onComplete: () => onSave(savedData),
      });
    } else {
      onSave(savedData);
    }
  });

  const isBatchMode = totalCount && totalCount > 1;
  const isLastItem = isBatchMode && currentIndex === totalCount;
  const submitButtonText = isBatchMode && !isLastItem ? '確認並繼續' : '確認';

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex flex-col bg-gray-50 pt-[60px] max-w-layout-container mx-auto z-[110] shadow-2xl"
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 w-full max-w-layout-container mx-auto bg-white p-4 shadow-sm flex items-center z-50">
        <button
          type="button"
          onClick={handleBackAnim}
          className="text-gray-600 mr-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">確認食材資訊</h1>
        {isBatchMode && (
          <span className="ml-auto text-sm font-medium text-slate-500">
            {currentIndex} / {totalCount}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 hide-scrollbar">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScanResultEditForm
            imageUrl={imageUrl || ''}
            register={register}
            control={control}
            errors={errors}
            currentUnit={initialData.unit}
            onRetake={onRetake}
            onPickImage={onPickImage}
          />

          {/* Fixed Footer */}
          <div className="fixed bottom-0 left-0 right-0 max-w-layout-container mx-auto px-4 py-6 bg-white rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-50">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBackAnim}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/30"
              >
                {submitButtonText}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
