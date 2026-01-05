import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';
import { getRefrigeratorId } from '@/modules/inventory/utils/getRefrigeratorId';
import { useAuth } from '@/modules/auth';
import { groupsApi } from '@/modules/groups/api';
import { useEffect } from 'react';

const ScanResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Redux state for batch scan
  const { items, currentIndex } = useSelector(
    (state: RootState) => state.batchScan,
  );

  // Groups and Refrigerator ID logic
  const groups = useSelector(selectAllGroups);
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);
  // ScanResult doesn't have groupId in URL, so we rely on active or default
  const targetGroupId =
    activeRefrigeratorId || getRefrigeratorId(undefined, groups);

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

  if (!displayResult && !showSuccessModal) {
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

  const handleConfirm = async () => {
    setSubmitStatus('submitting');
    try {
      // Use edited data if available, otherwise use initial data
      const dataToSubmit = editedData || initialData;
      await foodScanApi.submitFoodItem(dataToSubmit);
      const newSubmittedCount = submittedCount + 1;
      setSubmittedCount(newSubmittedCount);

      // 發送推播通知 (單筆)
      try {
        const notifyGroupId = dataToSubmit.groupId || targetGroupId;
        if (notifyGroupId) {
          // 2024-01-01 Fix: 依使用者要求，透過 API 取得成員列表發送通知
          // 不再依賴前端 groups state 判斷是否為共享群組
          let targetUserIds: string[] = [];
          try {
            const members = await groupsApi.getMembers(notifyGroupId);
            targetUserIds = members.map(m => m.id);
          } catch (fetchErr) {
            console.warn(`Failed to fetch members for group ${notifyGroupId}:`, fetchErr);
            // 若 API 失敗 (如個人冰箱無法取得成員)，降級為發送給自己
            if (user?.id) targetUserIds = [user.id];
          }

          if (targetUserIds.length > 0) {
            // 取得群組名稱和使用者名稱
            const currentGroup = groups.find((g) => g.id === notifyGroupId);
            const groupName = currentGroup?.name || '我的冰箱';
            const actorName = user?.displayName || user?.email || '使用者';

            import('@/api/services/notification').then(({ notificationService }) => {
              notificationService.sendNotification({
                type: 'inventory',
                subType: 'stockIn', // 新增 subType
                title: 'AI 辨識完成！食材已入庫',
                body: '剛買的食材已安全進入庫房，快去看看庫房！',
                userIds: targetUserIds,
                // groupId 設為 undefined，避免個人冰箱 ID 被後端視為無效群組 ID 而報錯 (400)
                // 我們已透過 userIds 指定接收者
                groupId: undefined,
                groupName,
                actorName,
                group_name: groupName,
                actor_name: actorName,
                action: {
                  type: 'inventory',
                  payload: {
                    refrigeratorId: notifyGroupId
                  }
                }
              }).catch(err => console.error('Failed to send notification:', err));
            });
          }
        }
      } catch (notifyError) {
        console.error('Notification error:', notifyError);
      }

      // Show completed state
      setSubmitStatus('completed');

      if (isBatchMode) {
        // Check if this is the last item BEFORE removing
        const isOnlyOneLeft = items.length === 1;

        setTimeout(() => {
          if (isOnlyOneLeft) {
            // All done - show success modal
            dispatch(reset());
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
    if (isBatchMode) {
      dispatch(reset());
    }
    navigate('/upload');
  };

  const handleDeleteItem = () => {
    if (isBatchMode) {
      if (items.length === 1) {
        // Last item being deleted, go back to upload
        dispatch(reset());
        navigate('/upload');
      } else {
        dispatch(removeItem(currentIndex));
        window.scrollTo(0, 0);
      }
    } else {
      // Single item mode - just go back
      navigate('/upload');
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

  const handleViewInventory = () => {
    navigate('/inventory');
  };

  const handleContinueScan = () => {
    navigate('/upload');
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
    try {
      // Submit all pending items
      let successCount = 0;
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.status === 'pending') {
          await foodScanApi.submitFoodItem(item.data);
          successCount++;
        }
      }
      setSubmittedCount(successCount);

      // 發送推播通知 (批次)
      try {
        if (successCount > 0 && targetGroupId) {
          let targetUserIds: string[] = [];
          try {
            const members = await groupsApi.getMembers(targetGroupId);
            targetUserIds = members.map(m => m.id);
          } catch (fetchErr) {
            console.warn(`Failed to fetch members for group ${targetGroupId}:`, fetchErr);
            if (user?.id) targetUserIds = [user.id];
          }

          if (targetUserIds.length > 0) {
            // 取得群組名稱和使用者名稱
            const currentGroup = groups.find((g) => g.id === targetGroupId);
            const groupName = currentGroup?.name || '我的冰箱';
            const actorName = user?.displayName || user?.email || '使用者';

            const message = successCount === 1 
              ? '剛買的食材已安全進入庫房，快去看看庫房！'
              : `${successCount} 項新食材已安全進入庫房，快去看看庫房！`;
              
            import('@/api/services/notification').then(({ notificationService }) => {
              notificationService.sendNotification({
                type: 'inventory',
                subType: 'stockIn', // 新增 subType
                title: 'AI 辨識完成！食材已入庫',
                body: message,
                userIds: targetUserIds,
                groupId: undefined,
                groupName,
                actorName,
                group_name: groupName,
                actor_name: actorName,
                action: {
                  type: 'inventory',
                  payload: {
                    refrigeratorId: targetGroupId
                  }
                }
              }).catch(err => console.error('Failed to send notification:', err));
            });
          }
        }
      } catch (notifyError) {
        console.error('Notification error:', notifyError);
      }

      setSubmitStatus('completed');

      setTimeout(() => {
        // Show success modal (don't reset here - let navigation handlers reset)
        setShowSuccessModal(true);
      }, 800);
    } catch (error) {
      console.error('Batch submission failed:', error);
      setSubmitStatus('idle');
    }
  };

  if (mode === 'preview' && displayResult) {
    return (
      <>
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
        <StockInSuccessModal
          isOpen={showSuccessModal}
          onViewInventory={handleViewInventory}
          onContinueScan={handleContinueScan}
          itemCount={submittedCount}
        />
      </>
    );
  }

  if (displayResult) {
    return (
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
    );
  }

  // Fallback if somehow execution gets here (e.g. showSuccessModal is true but no displayResult)
  if (showSuccessModal) {
    return (
      <StockInSuccessModal
        isOpen={showSuccessModal}
        onViewInventory={handleViewInventory}
        onContinueScan={handleContinueScan}
        itemCount={submittedCount}
      />
    );
  }

  // Final fallback (should not be reached due to initial check, but for safety)
  return null;
};

export default ScanResult;
