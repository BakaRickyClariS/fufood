import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const OtherSettingsList = () => {
  const items = [
    { label: '問題與幫助', path: '/settings/help' },
    { label: '回報問題', path: '/settings/report' },
    { label: '使用說明', path: '/settings/guide' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-primary-500 rounded-full" />
        <h3 className="text-lg font-bold text-neutral-800">其他</h3>
      </div>
      
      <div className="flex flex-col divide-y divide-neutral-100">
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center justify-between py-4 hover:bg-neutral-50 transition-colors -mx-6 px-6"
          >
            <span className="text-base font-medium text-neutral-800">
              {item.label}
            </span>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </Link>
        ))}
        
        <div className="py-4 flex items-center justify-between -mx-6 px-6">
          <span className="text-base font-medium text-neutral-800">版本</span>
          <span className="text-sm font-medium text-neutral-500">
            FuFood 1.1
          </span>
        </div>
      </div>
    </div>
  );
};

export default OtherSettingsList;
