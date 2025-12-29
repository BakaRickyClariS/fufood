import { useNavigate } from 'react-router-dom';
import ComponentHeader from '@/modules/settings/components/SimpleHeader';
import { BookOpen, Search, Zap, Users } from 'lucide-react';

const GUIDES = [
  {
    icon: <Search className="w-6 h-6 text-blue-500" />,
    title: '智慧辨識食材',
    description:
      '使用相機拍攝發票或食材實體，系統會自動辨識品項名稱、數量與保存期限，省去手動輸入的麻煩。',
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    title: 'AI 智能食譜',
    description:
      '不知道煮什麼？勾選冰箱裡的現有食材，AI 大廚立即為您推薦美味食譜，消滅剩食零浪費！',
  },
  {
    icon: <Users className="w-6 h-6 text-green-500" />,
    title: '家庭群組共用',
    description:
      '邀請家人加入群組，同步管理冰箱庫存。一人購買、全家更新，再也不怕重複購買相同食材。',
  },
  {
    icon: <BookOpen className="w-6 h-6 text-purple-500" />,
    title: '分類與標籤管理',
    description:
      '自定義食材分類與存放位置（冷藏/冷凍/常溫），讓您的虛擬冰箱井然有序，隨時掌握庫存狀況。',
  },
];

const AppGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <ComponentHeader title="使用說明" onBack={() => navigate(-1)} />

      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-6">
        {/* Intro */}
        <div className="text-center py-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            掌握 FuFood 核心功能
          </h2>
          <p className="text-neutral-500 text-sm">讓食材管理變得輕鬆有趣</p>
        </div>

        {/* Guides List */}
        <div className="grid gap-4">
          {GUIDES.map((guide, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                {guide.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-800 mb-1">
                  {guide.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed text-justify">
                  {guide.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center py-8">
          <p className="text-sm text-neutral-400">
            想要了解更多進階技巧？
            <br />
            請關注我們的官方網站與粉絲專頁。
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppGuide;
