import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScanResultEditor } from '@/modules/food-scan/components/features/ScanResultEditor';
import { ScanResultPreview } from '@/modules/food-scan/components/features/ScanResultPreview';
import { StockInSuccessModal } from '@/modules/food-scan/components/ui/StockInSuccessModal';
import type { FoodItemInput } from '@/modules/food-scan/types';
import { foodScanApi } from '@/modules/food-scan/services';
import type { RootState } from '@/store';
import {
  goToNext,
  goToPrev,
  reset,
  removeItem,
} from '@/modules/food-scan/store/batchScanSlice';
import {
  selectAllGroups,
  fetchGroups,
} from '@/modules/groups/store/groupsSlice';
import { selectActiveGroupId } from '@/store/slices/activeGroupSlice';
import { identity } from '@/shared/utils/identity';
import { inventoryKeys } from '@/modules/inventory/api/queries';
import { useEffect } from 'react';
import { useTourStore } from '@/store/useTourStore';

type ScanResultModalProps = {
  isOpen: boolean;
  onClose: () => void;
  resultData?: FoodItemInput | null;
  resultImageUrl?: string;
};

const ScanResultModal: React.FC<ScanResultModalProps> = ({
  isOpen,
  onClose,
  resultData,
  resultImageUrl,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const modalRef = React.useRef<HTMLDivElement>(null);
  const { setStep } = useTourStore();

  // GSAP 進入/退出動畫
  useGSAP(
    () => {
      if (isOpen && modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.4, ease: 'power3.out' },
        );
      }
    },
    { scope: modalRef, dependencies: [isOpen] },
  );

  const { contextSafe } = useGSAP({ scope: modalRef });

  const handleCloseModal = contextSafe(() => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          if (items.length > 0) dispatch(reset());
          onClose();
        },
      });
    } else {
      if (items.length > 0) dispatch(reset());
      onClose();
    }
  });

  // Redux state for batch scan
  const { items, currentIndex } = useSelector(
    (state: RootState) => state.batchScan,
  );

  // Groups and Refrigerator ID logic
  const groups = useSelector(selectAllGroups);
  const activeGroupId = useSelector(selectActiveGroupId);
  // ScanResult doesn't have groupId in URL, so we rely on active or default
  const targetGroupId = activeGroupId || identity.getGroupId(undefined, groups);

  useEffect(() => {
    // Ensure groups are loaded so we can get the ID
    if (groups.length === 0) {
      dispatch(fetchGroups() as any);
    }
  }, [dispatch, groups.length]);

  // Local state fallbacks (legacy single item flow props)
  const locationResult = resultData;
  const locationImageUrl = resultImageUrl;

  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'submitting' | 'completed'
  >('idle');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [editedData, setEditedData] = useState<FoodItemInput | null>(null);

  // Determine current item to display
  const currentBatchItem = items[currentIndex];

  // Effective data sources
  const result = currentBatchItem ? currentBatchItem.data : locationResult;
  const imageUrl = currentBatchItem
    ? currentBatchItem.imageUrl
    : locationImageUrl;

  const isBatchMode = items.length > 0;

  // Cleanup on unmount if needed, or handle store reset appropriately
  // For now we reset on successful completion of the flow

  // Keep track of the last valid result to prevent "No Data" flash during transitions
  const [lastValidResult, setLastValidResult] = useState<FoodItemInput | null>(
    null,
  );
  const [lastValidImage, setLastValidImage] = useState<string>('');

  useEffect(() => {
    if (result) {
      setLastValidResult(result);
    }
    if (imageUrl) {
      setLastValidImage(imageUrl);
    }
  }, [result, imageUrl]);

  const displayResult = result || lastValidResult;
  const displayImage = imageUrl || lastValidImage;

  // Initial Data for editor - use displayResult to ensure we have data even if result is null temporarily
  const initialData: FoodItemInput = {
    productName: displayResult?.productName || '',
    category: displayResult?.category || 'others',
    attributes: displayResult?.attributes || [],
    purchaseQuantity: displayResult?.purchaseQuantity || 1,
    unit: displayResult?.unit || '個',
    purchaseDate:
      displayResult?.purchaseDate || new Date().toISOString().split('T')[0],
    expiryDate: displayResult?.expiryDate || '',
    lowStockAlert: displayResult?.lowStockAlert ?? true,
    lowStockThreshold: displayResult?.lowStockThreshold || 2,
    notes: displayResult?.notes || '',
    imageUrl: displayImage,
    groupId: targetGroupId || undefined,
  };

  if (!isOpen) {
    return null;
  }

  if (!displayResult && !showSuccessModal) {
    return createPortal(
      <div
        ref={modalRef}
        className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-white p-6 text-center shadow-xl"
      >
        <h2 className="text-xl font-bold text-slate-800 mb-2">無資料</h2>
        <p className="text-slate-500 mb-6">找不到掃描結果，請重新掃描。</p>
        <button
          onClick={handleCloseModal}
          className="bg-red-500 text-white px-6 py-2 rounded-full font-bold"
        >
          返回掃描
        </button>
      </div>,
      document.body,
    );
  }

  const handleConfirm = async () => {
    setSubmitStatus('submitting');
    try {
      // Use edited data if available, otherwise use initial data
      const dataToSubmit = editedData || initialData;
      await foodScanApi.submitFoodItem(dataToSubmit);

      // 入庫成功後觸發庫存列表更新
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });

      const newSubmittedCount = submittedCount + 1;
      setSubmittedCount(newSubmittedCount);

      // 通知由後端在 API 完成時自動觸發，前端不再手動發送

      // Show completed state
      setSubmitStatus('completed');

      if (isBatchMode) {
        // Check if this is the last item BEFORE removing
        const isOnlyOneLeft = items.length === 1;

        setTimeout(() => {
          if (isOnlyOneLeft) {
            // All done - show success modal
            setShowSuccessModal(true);
          } else {
            // Remove current item from batch (next item will auto-display)
            dispatch(removeItem(currentIndex));
            setSubmitStatus('idle');
            setEditedData(null);
          }
        }, 800);
      } else {
        // Single item mode - show success modal after brief delay
        setTimeout(() => {
          setShowSuccessModal(true);
        }, 800);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitStatus('idle');
      // Handle error (maybe show toast)
    }
  };

  // Editor component calls this to save edited data (no submission)
  const handleEditorSave = (data: FoodItemInput) => {
    setEditedData(data);
    setMode('preview');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    handleCloseModal();
  };

  const handleDeleteItem = () => {
    if (isBatchMode) {
      if (items.length === 1) {
        // Last item being deleted, go back to upload
        handleCloseModal();
      } else {
        dispatch(removeItem(currentIndex));
        if (modalRef.current) {
          modalRef.current.scrollTo(0, 0);
        }
      }
    } else {
      // Single item mode - just close
      handleCloseModal();
    }
  };

  const handleRetake = () => {
    handleCloseModal();
  };

  const handlePickImage = () => {
    handleCloseModal();
  };

  const handleViewInventory = () => {
    if (isBatchMode) {
      dispatch(reset());
    }
    setStep('INVENTORY_WARNING');
    navigate('/inventory');
  };

  const handleContinueScan = () => {
    handleCloseModal();
  };

  // Navigation handlers for batch mode
  const handlePrev = () => {
    if (currentIndex > 0) {
      dispatch(goToPrev());
      setEditedData(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      dispatch(goToNext());
      setEditedData(null);
    }
  };

  // Batch confirm all handler
  const handleConfirmAll = async () => {
    setSubmitStatus('submitting');

    // Track results
    let successCount = 0;
    const failedIndices: number[] = [];
    const successIndices: number[] = [];

    // We need to process items one by one
    // CAUTION: resolving Redux state changes in loop is tricky since indices shift if we delete immediately.
    // Strategy:
    // 1. Try to submit all pending items.
    // 2. record which indices succeeded.
    // 3. Dispatch remove actions for successful indices (from largest to smallest to maintain index validity) or use a bulk remove if available.
    // Since we only have removeItem(index), we must be careful.

    // Snapshot current items to avoid index confusion if state updates async (though redux state in var is snapshot)
    const currentItems = [...items];

    for (let i = 0; i < currentItems.length; i++) {
      const item = currentItems[i];
      // Only process pending items
      if (item.status === 'pending') {
        try {
          await foodScanApi.submitFoodItem(item.data);
          successCount++;
          successIndices.push(i);
        } catch (err) {
          console.error(`Item ${i} (${item.data.productName}) failed:`, err);
          failedIndices.push(i);
        }
      }
    }

    // Update submitted count state
    setSubmittedCount((prev) => prev + successCount);

    if (successCount > 0) {
      // Invalidate queries to refresh inventory
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });

      // 通知由後端在 API 完成時自動觸發，前端不再手動發送
    }

    // Handle UI updates based on results
    if (successIndices.length > 0) {
      // Remove successful items.
      // To remove multiple items by index without messing up subsequent indices, remove from largest index to smallest.
      const indicesToRemove = [...successIndices].sort((a, b) => b - a);

      indicesToRemove.forEach((index) => {
        dispatch(removeItem(index));
      });
    }

    setSubmitStatus('idle'); // Always return to idle to allow user to retry failed items or confirm success

    // Decision: What to show?
    // If ALL succeeded -> Show Success Modal
    // If PARTIAL succeeded -> Maybe show toast or partial success msg?
    // Current requirement: "背景通知有跳出入庫完成通知" -> implies success modal might be confusing if shown for partial.
    // Let's stick to logic: If nothing left (all succeeded), show modal. If some left, user sees them.

    // Check remaining items count AFTER removal
    const remainingCount = currentItems.length - successCount;

    if (remainingCount === 0) {
      setSubmitStatus('completed');
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 500);
    } else {
      // Maybe show a toast about failed items?
      // For now, doing nothing lets user see failed items are still there.
      if (successCount > 0) {
        // Optionally show a toast saying "X items added, Y failed"
        // Using console for now as we don't have a standardized toast handy in this context,
        // but the remaining items in list is a visual cue.
      }
    }
  };

  // Single cohesive Portal for stable outer animation with modalRef
  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 z-100 bg-white overflow-hidden"
    >
      {displayResult && (
        <div className="tour-step-scan-confirm h-full">
          <ScanResultPreview
            result={editedData || displayResult}
            imageUrl={displayImage}
            onEdit={() => setMode('edit')}
            onConfirm={handleConfirm}
            onBack={handleBack}
            onDelete={handleDeleteItem}
            onPrev={handlePrev}
            onNext={handleNext}
            onConfirmAll={handleConfirmAll}
            submitStatus={submitStatus}
            currentIndex={isBatchMode ? currentIndex + 1 : undefined}
            totalCount={isBatchMode ? items.length : undefined}
          />
        </div>
      )}

      {mode === 'edit' && displayResult && (
        <ScanResultEditor
          initialData={editedData || displayResult}
          imageUrl={displayImage || ''}
          onSave={handleEditorSave}
          onBack={() => setMode('preview')}
          onRetake={handleRetake}
          onPickImage={handlePickImage}
          currentIndex={isBatchMode ? currentIndex + 1 : undefined}
          totalCount={isBatchMode ? items.length : undefined}
        />
      )}

      <StockInSuccessModal
        isOpen={showSuccessModal}
        onViewInventory={handleViewInventory}
        onContinueScan={handleContinueScan}
        itemCount={submittedCount}
      />
    </div>,
    document.body,
  );
};

export default ScanResultModal;
