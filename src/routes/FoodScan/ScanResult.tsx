import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ScanResultEditor } from '@/modules/food-scan/components/features/ScanResultEditor';
import { ScanResultPreview } from '@/modules/food-scan/components/features/ScanResultPreview';
import type { FoodItemInput } from '@/modules/food-scan/types';
import { foodScanApi } from '@/modules/food-scan/services';

const ScanResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, imageUrl } = location.state || {};
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');

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

  // Ensure result matches FoodItemInput type or cast it
  const initialData: FoodItemInput = {
      productName: result.productName || '',
      category: result.category || '其他',
      attributes: result.attributes || '常溫',
      purchaseQuantity: result.purchaseQuantity || 1,
      unit: result.unit || '個',
      purchaseDate: result.purchaseDate || new Date().toISOString().split('T')[0],
      expiryDate: result.expiryDate || '',
      lowStockAlert: result.lowStockAlert ?? true,
      lowStockThreshold: result.lowStockThreshold || 2,
      notes: result.notes || '',
      imageUrl: imageUrl
  };

  const handleConfirm = async () => {
    try {
      await foodScanApi.submitFoodItem(initialData);
      navigate('/inventory');
    } catch (error) {
      console.error('Submission failed:', error);
      // Handle error (maybe show toast)
    }
  };

  const handleRetake = () => {
    navigate('/upload');
  };

  const handlePickImage = () => {
    navigate('/upload'); // Or open gallery if possible, but for now redirect to upload
  };

  if (mode === 'preview') {
    return (
      <ScanResultPreview
        result={initialData}
        imageUrl={imageUrl}
        onEdit={() => setMode('edit')}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <ScanResultEditor 
      initialData={initialData} 
      imageUrl={imageUrl}
      onSuccess={() => navigate('/inventory')}
      onBack={() => setMode('preview')}
      onRetake={handleRetake}
      onPickImage={handlePickImage}
    />
  );
};

export default ScanResult;
