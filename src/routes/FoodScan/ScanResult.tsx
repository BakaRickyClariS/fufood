import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ScanResultEditor } from '@/modules/food-scan/components/features/ScanResultEditor';
import { ScanResultPreview } from '@/modules/food-scan/components/features/ScanResultPreview';
import type { FoodItemInput } from '@/modules/food-scan/types';
import { foodScanApi } from '@/modules/food-scan/services';
import type { RootState } from '@/store';
import {
  markCurrentAsSubmitted,
  goToNext,
  reset,
} from '@/modules/food-scan/store/batchScanSlice';
import {
  selectAllGroups,
  fetchGroups,
} from '@/modules/groups/store/groupsSlice';
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';
import { getRefrigeratorId } from '@/modules/inventory/utils/getRefrigeratorId';
import { useEffect } from 'react';

const ScanResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state for batch scan
  const { items, currentIndex } = useSelector(
    (state: RootState) => state.batchScan,
  );

  // Groups and Refrigerator ID logic
  const groups = useSelector(selectAllGroups);
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);
  // ScanResult doesn't have groupId in URL, so we rely on active or default
  const targetGroupId = activeRefrigeratorId || getRefrigeratorId(undefined, groups);

  useEffect(() => {
    // Ensure groups are loaded so we can get the ID
    if (groups.length === 0) {
      // @ts-ignore
      dispatch(fetchGroups());
    }
  }, [dispatch, groups.length]);

  // Local state fallbacks (legacy single item flow)
  const { result: locationResult, imageUrl: locationImageUrl } =
    location.state || {};

  const [mode, setMode] = useState<'preview' | 'edit'>('preview');

  // Determine current item to display
  const currentBatchItem = items[currentIndex];

  // Effective data sources
  const result = currentBatchItem ? currentBatchItem.data : locationResult;
  const imageUrl = currentBatchItem
    ? currentBatchItem.imageUrl
    : locationImageUrl;

  const isBatchMode = items.length > 0;
  const isLastItem = currentIndex === items.length - 1;

  // Cleanup on unmount if needed, or handle store reset appropriately
  // For now we reset on successful completion of the flow

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
    category: result.category || 'others',
    attributes: result.attributes || [],
    purchaseQuantity: result.purchaseQuantity || 1,
    unit: result.unit || '個',
    purchaseDate: result.purchaseDate || new Date().toISOString().split('T')[0],
    expiryDate: result.expiryDate || '',
    lowStockAlert: result.lowStockAlert ?? true,
    lowStockThreshold: result.lowStockThreshold || 2,
    notes: result.notes || '',
    imageUrl: imageUrl,
    groupId: targetGroupId || undefined,
  };

  const handleConfirm = async () => {
    try {
      await foodScanApi.submitFoodItem(initialData);

      if (isBatchMode) {
        dispatch(markCurrentAsSubmitted());

        if (isLastItem) {
          // All done
          dispatch(reset());
          navigate('/inventory');
        } else {
          // Go to next item
          dispatch(goToNext());
          setMode('preview'); // Reset mode for next item
          // Scroll to top or reset view if needed
          window.scrollTo(0, 0);
        }
      } else {
        // Single item mode (Legacy)
        navigate('/inventory');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      // Handle error (maybe show toast)
    }
  };

  // Editor component calls this on success. In batch mode, success means confirm & next.
  // We need to modify Editor to not navigate away but call a prop function that we can hook into handleConfirm.
  // Actually ScanResultEditor calls onSuccess.
  const handleEditorSuccess = () => {
    // If Editor handles submission internally (it calls useFoodItemSubmit), then we just need to handle navigation.
    // BUT: ScanResultPreview calls handleConfirm which calls api.submitFoodItem.
    // ScanResultEditor calls submitFoodItem via hook.

    // We should unify this. Ideally ScanResultEditor shouldn't submit if we want to orchestrate here,
    // OR ScanResultEditor submits and we just update state.

    // Current ScanResultEditor impl:
    // const onSubmit = async (data) => { await submitFoodItem(data); onSuccess(); }

    // So if Editor submits, we just need to handle the "Next" logic in onSuccess.

    if (isBatchMode) {
      dispatch(markCurrentAsSubmitted());

      if (isLastItem) {
        dispatch(reset());
        navigate('/inventory');
      } else {
        dispatch(goToNext());
        setMode('preview');
        window.scrollTo(0, 0);
      }
    } else {
      navigate('/inventory');
    }
  };

  const handleRetake = () => {
    if (isBatchMode) {
      // In batch mode, "retake" might mean delete this item or re-scan just this one?
      // For MVP, maybe just go back to upload and clear everything?
      // Or "Discard" current item?
      // Let's keep it simple: clear batch and go back.
      dispatch(reset());
    }
    navigate('/upload');
  };

  const handlePickImage = () => {
    if (isBatchMode) dispatch(reset());
    navigate('/upload');
  };

  if (mode === 'preview') {
    return (
      <ScanResultPreview
        result={initialData}
        imageUrl={imageUrl}
        onEdit={() => setMode('edit')}
        onConfirm={handleConfirm}
        currentIndex={isBatchMode ? currentIndex + 1 : undefined}
        totalCount={isBatchMode ? items.length : undefined}
      />
    );
  }

  return (
    <ScanResultEditor
      initialData={initialData}
      imageUrl={imageUrl}
      onSuccess={handleEditorSuccess}
      onBack={() => setMode('preview')}
      onRetake={handleRetake}
      onPickImage={handlePickImage}
      currentIndex={isBatchMode ? currentIndex + 1 : undefined}
      totalCount={isBatchMode ? items.length : undefined}
    />
  );
};

export default ScanResult;
