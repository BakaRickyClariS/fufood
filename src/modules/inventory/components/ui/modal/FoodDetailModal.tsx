import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ChevronLeft, Bell, BellRing } from 'lucide-react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { InfoTooltip } from '@/shared/components/feedback/InfoTooltip';
import type { FoodItem } from '@/modules/inventory/types';
import { useExpiryCheck } from '@/modules/inventory/hooks';
import { inventoryApi } from '@/modules/inventory/api';
// 引入 AI API
import { aiRecipeApi } from '@/modules/ai/api/aiRecipeApi';
import { ConsumptionModal } from '@/modules/inventory/components/consumption';
import { useInventorySettingsQuery } from '@/modules/inventory/api/queries';

type FoodDetailModalProps = {
  item: FoodItem;
  isOpen: boolean;
  onClose: () => void;
  onItemUpdate?: () => void;
};

import { createPortal } from 'react-dom';

// ... (other imports)

const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onItemUpdate,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  // const contentRef = useRef<HTMLDivElement>(null); // No longer needed for scroll listener if we just want static header

  // 消耗 Modal 狀態
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);

  // 通知設定狀態
  const [lowStockAlertEnabled, setLowStockAlertEnabled] = useState(
    item.lowStockAlert ?? false,
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();
  const { status, daysUntilExpiry } = useExpiryCheck(item);

  // 取得設定資料以獲取分類中文名稱
  const { data: settingsData } = useInventorySettingsQuery(item.groupId);

  // 建立 category ID → 中文名稱的映射
  const categoryNameMap = useMemo(() => {
    const categories = settingsData?.data?.settings?.categories || [];
    return categories.reduce(
      (acc, cat) => {
        acc[cat.id] = cat.title;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [settingsData]);

  // 日期格式化工具函數
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // 同步 item 狀態
  useEffect(() => {
    setLowStockAlertEnabled(item.lowStockAlert ?? false);
  }, [item.lowStockAlert]);

  // GSAP 進場動畫
  useEffect(() => {
    if (isOpen) {
      const tl = gsap.timeline();
      // 從右側滑入完整頁面
      tl.fromTo(
        modalRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' },
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: onClose,
    });
    // 向右滑出
    tl.to(modalRef.current, {
      x: '100%',
      duration: 0.3,
      ease: 'power3.in',
    });
  };

  const handleToggleAlert = async () => {
    if (isUpdating) return;
    const newValue = !lowStockAlertEnabled;
    setLowStockAlertEnabled(newValue);
    setIsUpdating(true);

    try {
      await inventoryApi.updateItem(
        item.id,
        {
          lowStockAlert: newValue,
        },
        item.groupId,
      );
      onItemUpdate?.();
    } catch (error) {
      setLowStockAlertEnabled(!newValue);
      console.error('更新低庫存通知失敗:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 處理食譜靈感 (AI 生成)
  const handleRecipeInspiration = async () => {
    try {
      const result = await aiRecipeApi.generateRecipe({
        prompt: `使用 ${item.name} 製作料理`,
        selectedIngredients: [item.name],
      });

      if (result.data.recipes && result.data.recipes.length > 0) {
        navigate(`/planning?tab=recipes&recipeId=${result.data.recipes[0].id}`);
      }

      handleClose();
    } catch (error) {
      console.error('Failed to generate recipe', error);
    }
  };

  const getStatusBadge = () => {
    let bgClass = 'bg-success-500';
    let text = '有庫存';

    switch (status) {
      case 'expired':
        bgClass = 'bg-danger-500';
        text = '已過期';
        break;
      case 'expiring-soon':
        bgClass = 'bg-warning-500';
        text = '即將過期';
        break;
      case 'low-stock':
        bgClass = 'bg-primary-400';
        text = '低庫存';
        break;
      default:
        bgClass = 'bg-success-500';
        text = '有庫存';
        break;
    }

    return (
      <span
        className={`px-3 py-1 ${bgClass} text-white text-sm font-bold rounded-full`}
      >
        {text}
      </span>
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] bg-white flex flex-col"
    >
      {/* Consumpion Modal */}
      <ConsumptionModal
        isOpen={showConsumptionModal}
        onClose={() => setShowConsumptionModal(false)}
        singleItem={{
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit || '個',
          expiryDate: item.expiryDate,
        }}
        refrigeratorId={item.groupId}
        onConfirm={() => {
          // 消耗完成後只關閉 ConsumptionModal
          // 不自動關閉食材詳細頁面，讓用戶決定是否返回
          setShowConsumptionModal(false);
          onItemUpdate?.(); // 刷新數據
        }}
        onCloseAll={(onParentClosed) => {
          // 返回庫房時：先播放食材詳細頁的離場動畫
          if (modalRef.current) {
            gsap.to(modalRef.current, {
              x: '100%',
              duration: 0.3,
              ease: 'power3.in',
              onComplete: () => {
                // 動畫完成後呼叫 callback
                onParentClosed();
              },
            });
          } else {
            onParentClosed();
          }
        }}
      />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 px-4 py-3 flex items-center justify-between bg-black/20">
        <button
          onClick={handleClose}
          className="p-1 -ml-1 rounded-full text-white hover:bg-black/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 drop-shadow-md" />
        </button>
        {/* Helper layout for centering */}
        <div className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-white drop-shadow-md">
          {item.category}
        </div>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto w-full h-full bg-white pb-10">
        <div className="min-h-full flex flex-col">
          {/* Image & Banner */}
          <div className="relative h-64 w-full shrink-0">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Removed Category Label from Image */}
          </div>
          <div className="relative z-10 -mt-6 bg-white rounded-t-xl p-6 space-y-6 flex-1">
            {/* Title & Alert Row */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">
                {item.name}
              </h2>
              <button
                onClick={handleToggleAlert}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                  lowStockAlertEnabled
                    ? 'bg-primary-50 text-primary-500'
                    : 'bg-gray-100 text-neutral-500 hover:bg-gray-200'
                }`}
              >
                {lowStockAlertEnabled ? (
                  <>
                    <BellRing className="w-4 h-4 fill-current" />
                    開啟低庫存通知
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    開啟低庫存通知
                  </>
                )}
              </button>
            </div>

            <div className="w-full h-px bg-neutral-200" />

            {/* Details List */}
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-neutral-500 font-medium flex items-center gap-1">
                  食材狀態
                  <InfoTooltip content="庫存狀態說明..." />
                </span>
                {getStatusBadge()}
              </div>

              {/* Category */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-neutral-500 font-medium">
                  產品分類
                </span>
                <span className="text-lg text-neutral-900 font-medium">
                  {categoryNameMap[item.category] || item.category || '未分類'}
                </span>
              </div>

              {/* Attributes */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-neutral-500 font-medium">
                  產品屬性
                </span>
                <span className="text-lg text-neutral-900 font-medium">
                  {item.attributes?.join('、') || '葉菜根莖類'}
                </span>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-neutral-500 font-medium flex items-center gap-1">
                  單位數量 <InfoTooltip content="數量說明..." />
                </span>
                <span className="text-lg text-neutral-900 font-bold">
                  {item.quantity} / {item.unit || '個'}
                </span>
              </div>

              <div className="w-full h-px bg-neutral-200 my-2" />

              {/* Dates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-neutral-500 font-medium">
                    入庫日期
                  </span>
                  <span className="text-lg text-neutral-900 font-medium">
                    {formatDate(item.purchaseDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg text-neutral-500 font-medium">
                    保存期限
                  </span>
                  <span
                    className={`text-lg font-medium ${daysUntilExpiry < 0 ? 'text-red-500' : 'text-neutral-900'}`}
                  >
                    {daysUntilExpiry < 0 ? `已過期` : `約${daysUntilExpiry}天`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg text-neutral-500 font-medium">
                    過期日期
                  </span>
                  <span className="text-lg text-neutral-900 font-medium">
                    {formatDate(item.expiryDate)}
                  </span>
                </div>
              </div>

              <div className="w-full h-px bg-neutral-200 my-2" />

              {/* Notes */}
              <div className="flex items-start justify-between">
                <span className="text-lg text-neutral-500 font-medium flex items-center gap-1">
                  備註 <InfoTooltip content="備註..." />
                </span>
                <span className="text-lg text-neutral-900 font-medium text-right max-w-[60%]">
                  {item.notes || '好市多購入，季節限定'}
                </span>
              </div>
            </div>

            {/* Bottom Buttons (Not fixed, flow with content) */}
            <div className="flex items-center gap-3">
              <button
                className="flex-1 py-3 bg-white border border-neutral-300 rounded-lg text-base text-neutral-900 font-bold active:scale-95 transition-transform"
                onClick={() => setShowConsumptionModal(true)}
              >
                消耗食材
              </button>
              <button
                className="flex-1 py-3 bg-primary-400 text-white rounded-lg text-base font-bold active:scale-95 transition-transform shadow-md shadow-orange-100"
                onClick={handleRecipeInspiration}
              >
                食譜靈感
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default FoodDetailModal;
