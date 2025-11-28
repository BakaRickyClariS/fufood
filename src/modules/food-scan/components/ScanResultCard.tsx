import React from 'react';
import { Check, Tag, Box, Calendar, FileText } from 'lucide-react';
import type { AnalyzeResponse } from '@/modules/food-scan/services/ocrService';

type ScanResultCardProps = {
  result: AnalyzeResponse['data'];
  imageUrl: string;
};

const ScanResultCard: React.FC<ScanResultCardProps> = ({
  result,
  imageUrl,
}) => (
  <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 relative overflow-visible mt-12">
    {/* Floating Image */}
    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
      <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={result.productName}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Success Badge */}
      <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
        <Check size={16} strokeWidth={3} />
      </div>
    </div>

    <div className="mt-12 text-center mb-8">
      <p className="text-sm text-slate-500 mb-1">辨識產品名</p>
      <h2 className="text-2xl font-bold text-slate-800">
        {result.productName}
      </h2>
    </div>

    {/* Details List */}
    <div className="space-y-4">
      <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          <Tag size={18} />
          <span className="text-sm font-medium">產品分類</span>
        </div>
        <span className="font-bold text-slate-800">{result.category}</span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          <Box size={18} />
          <span className="text-sm font-medium">產品屬性</span>
        </div>
        <span className="font-bold text-slate-800">{result.attributes}</span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="text-sm font-medium pl-8">購物數量</span>
        </div>
        <span className="font-bold text-slate-800">
          {result.purchaseQuantity} {result.unit}
        </span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          <Calendar size={18} />
          <span className="text-sm font-medium">購物日期</span>
        </div>
        <span className="font-bold text-slate-800">
          {new Date(result.purchaseDate).toLocaleDateString('zh-TW')}
        </span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="text-sm font-medium pl-8">過期日期</span>
        </div>
        <span className="font-bold text-slate-800">
          {new Date(result.expiryDate).toLocaleDateString('zh-TW')}
        </span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="text-sm font-medium pl-8">開啟通知</span>
        </div>
        <span className="font-bold text-slate-800">
          {result.lowStockAlert ? '開啟' : '關閉'}
        </span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="text-sm font-medium pl-8">低庫存數量通知</span>
        </div>
        <span className="font-bold text-slate-800">
          {result.lowStockThreshold}
        </span>
      </div>

      <div className="flex justify-between items-start py-2">
        <div className="flex items-center gap-3 text-slate-500 mt-1">
          <FileText size={18} />
          <span className="text-sm font-medium">備註</span>
        </div>
        <span className="font-bold text-slate-800 max-w-[50%] text-right">
          {result.notes}
        </span>
      </div>
    </div>
  </div>
);

export default ScanResultCard;
