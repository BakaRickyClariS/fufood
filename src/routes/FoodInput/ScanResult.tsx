import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { AnalyzeResponse } from '@/modules/food-scan/services/ocrService';
import ScanResultCard from '@/modules/food-scan/components/ScanResultCard';

const ScanResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, imageUrl } =
    (location.state as {
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
        <ScanResultCard result={result} imageUrl={imageUrl} />
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
