import React from 'react';
import { useForm } from 'react-hook-form';
import { useFoodItemSubmit } from '../../hooks/useFoodItemSubmit';
import ScanResultEditForm from '../forms/ScanResultEditForm';
import { type FoodItemInput } from '../../types';

type ScanResultEditorProps = {
  initialData: FoodItemInput;
  imageUrl?: string;
  onSuccess: () => void;
  onBack: () => void;
  onRetake?: () => void;
  onPickImage?: () => void;
};

export const ScanResultEditor: React.FC<ScanResultEditorProps> = ({
  initialData,
  imageUrl,
  onSuccess,
  onBack,
  onRetake,
  onPickImage,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FoodItemInput>({
    defaultValues: initialData,
  });

  const { submitFoodItem, isSubmitting, error } = useFoodItemSubmit();

  const onSubmit = async (data: FoodItemInput) => {
    const result = await submitFoodItem(data);
    if (result && result.success) {
      onSuccess();
    }
  };

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
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScanResultEditForm
            imageUrl={imageUrl || ''}
            register={register}
            control={control}
            errors={errors}
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
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/30 disabled:opacity-50"
            >
              {isSubmitting ? '處理中...' : '確認歸納'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
