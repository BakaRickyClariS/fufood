import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type {
  AnalyzeResponse,
} from '@/modules/food-scan/services/ocrService';
import {
  submitFoodItem,
} from '@/modules/food-scan/services/ocrService';
import ScanResultCard from '@/modules/food-scan/components/ScanResultCard';
import ScanResultEditForm from '@/modules/food-scan/components/ScanResultEditForm';

const ScanResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { result, imageUrl } =
    (location.state as {
      result: AnalyzeResponse['data'];
      imageUrl: string;
    }) || {};

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AnalyzeResponse['data']>({
    defaultValues: result || {
      productName: '',
      category: '',
      attributes: '',
      purchaseQuantity: 1,
      unit: '個',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      lowStockAlert: true,
      lowStockThreshold: 2,
      notes: '',
    },
  });

  const onSubmit: SubmitHandler<AnalyzeResponse['data']> = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await submitFoodItem({ ...data, imageUrl });
      if (response.success) {
        console.log('Success:', response);
        navigate('/inventory');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (result) {
      reset(result);
    }
  };

  const handleDirectSubmit = async () => {
    if (result) {
      await onSubmit(result);
    }
  };

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">無資料</h2>
        <p className="text-slate-500 mb-6">找不到掃描結果，請重新掃描。</p>
        <button
          onClick={() => navigate('/upload')}
          className="bg-red-500 text-white px-6 py-2 rounded-full font-bold"
        >
          返回掃描
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
        <button 
          onClick={() => isEditing ? setIsEditing(false) : navigate('/upload')} 
          className="p-2 -ml-2"
        >
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-slate-800 mr-8">
          {isEditing ? '編輯草稿' : '掃描結果'}
        </h1>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 p-6 mb-20 gap-6"
        >
          <div className="flex-1 overflow-y-auto">
            <ScanResultEditForm
              imageUrl={imageUrl}
              register={register}
              control={control}
              errors={errors}
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/30 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '處理中...' : '確認歸納倉庫'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full bg-white text-slate-700 font-bold py-4 rounded-2xl border border-slate-200 active:bg-slate-50 transition-colors"
            >
              重設
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col flex-1 p-6 mb-20 gap-6">
          <div className="flex-1 overflow-y-auto">
            <ScanResultCard result={result} imageUrl={imageUrl} />
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/30 active:scale-[0.98] transition-transform"
            >
              編輯草稿
            </button>
            <button 
              onClick={handleDirectSubmit}
              disabled={isSubmitting}
              className="w-full bg-white text-slate-700 font-bold py-4 rounded-2xl border border-slate-200 active:bg-slate-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '處理中...' : '確認歸納倉庫'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanResult;
