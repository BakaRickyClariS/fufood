import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

  // No submission here - just save edited data and go back to preview
  const onSubmit = (data: FoodItemInput) => {
    // Merge form data with initialData to preserve fields like groupId and imageUrl
    const savedData: FoodItemInput = {
      ...initialData,
      ...data,
      groupId: initialData.groupId,
      imageUrl: initialData.imageUrl,
    };
    onSave(savedData);
  };

  const isBatchMode = totalCount && totalCount > 1;
  const isLastItem = isBatchMode && currentIndex === totalCount;
  const submitButtonText = isBatchMode && !isLastItem ? '確認並繼續' : '確認';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-600 mr-4">
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

      <div className="p-4">
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

          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={onBack}
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
        </form>
      </div>
    </div>
  );
};
