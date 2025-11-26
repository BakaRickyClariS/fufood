import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Calendar, Tag, Box, FileText } from 'lucide-react';
import type { AnalyzeResponse } from '@/features/food-scan/services/ocrService';

const ScanResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, imageUrl } = (location.state as {
    result: AnalyzeResponse['data'];
    imageUrl: string;
  }) || {};

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate('/upload')} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-slate-800 mr-8">
          掃描結果
        </h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto pb-32">
        {/* Main Card */}
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
              <span className="font-bold text-slate-800">
                {result.attributes}
              </span>
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
      </div>

      {/* Bottom Actions */}
      <div className="bg-white p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] sticky bottom-0">
        <div className="flex flex-col gap-3">
          <button className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/30 active:scale-[0.98] transition-transform">
            編輯草稿
          </button>
          <button className="w-full bg-white text-slate-700 font-bold py-4 rounded-2xl border border-slate-200 active:bg-slate-50 transition-colors">
            確認歸納倉庫
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanResult;
