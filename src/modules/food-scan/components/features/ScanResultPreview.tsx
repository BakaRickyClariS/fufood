import React from 'react';
import { ChefHat } from 'lucide-react';
import type { FoodItemInput } from '../../types';
import { calculateShelfLife } from '../../utils/dateHelpers';
import resultDecoration from '@/assets/images/food-scan/result.png';

type ScanResultPreviewProps = {
  result: FoodItemInput;
  imageUrl: string;
  onEdit: () => void;
  onConfirm: () => void;
};

const DetailRow: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
    <span className="text-slate-500 font-medium">{label}</span>
    <span className="text-slate-800 font-bold">{value}</span>
  </div>
);

export const ScanResultPreview: React.FC<ScanResultPreviewProps> = ({
  result,
  imageUrl,
  onEdit,
  onConfirm,
}) => {
  // 計算保存期限
  const shelfLifeDays = calculateShelfLife(
    result.purchaseDate,
    result.expiryDate,
  );

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-y-auto">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-center text-lg font-bold text-slate-800">
          掃描結果
        </h1>
      </div>

      {/* 頂部裝飾圖片 - result.png */}
      <div className="relative w-full">
        <img
          src={resultDecoration}
          alt="Result decoration"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* 內容區域 */}
      <div className="px-6 -mt-12 relative z-10">
        {/* 產品名稱區塊 - 修改佈局：圖片在右側 */}
        <div className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-red-500 rounded-full"></div>
              <p className="text-xs text-slate-500 font-medium">辨識產品名</p>
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {result.productName}
            </h2>
          </div>

          {/* 產品小圖 (右側) */}
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 flex-shrink-0 shadow-sm">
            <img
              src={imageUrl}
              className="w-full h-full object-cover"
              alt="Product Thumbnail"
            />
          </div>
        </div>

        {/* 詳細說明 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-red-500 rounded-full"></div>
            <h3 className="font-bold text-slate-800">詳細說明</h3>
          </div>

          <div className="space-y-1">
            <DetailRow label="產品分類" value={result.category} />
            <DetailRow label="產品屬性" value={result.attributes} />
            <DetailRow
              label="單位數量"
              value={`${result.purchaseQuantity} / ${result.unit}`}
            />
            <DetailRow label="入庫日期" value={result.purchaseDate} />
            <DetailRow label="保存期限" value={`約${shelfLifeDays}天`} />
            <DetailRow label="過期日期" value={result.expiryDate} />
            <DetailRow label="備註" value={result.notes || '-'} />
          </div>
        </div>
      </div>

      {/* 按鈕區域 - 改為跟隨內容滾動，垂直排列 */}
      <div className="px-4 mt-6 flex flex-col gap-3">
        <button
          onClick={onEdit}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
        >
          編輯草稿
        </button>
        <button
          onClick={onConfirm}
          className="w-full bg-white border-2 border-slate-100 text-slate-800 hover:bg-slate-50 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <ChefHat size={20} />
          確認歸納
        </button>
      </div>

      {/* 底部留白，確保不被 Bottom Navigation 遮擋 */}
      <div className="h-24"></div>
    </div>
  );
};
