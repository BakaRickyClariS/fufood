import { ShieldUser, ClipboardClock, UserRoundCheck, Bubbles } from 'lucide-react';
import { cn } from '@/shared/utils/styleUtils';

type QuickActionsProps = {
  onNavigate: (key: string) => void;
};

const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  const actions = [
    {
      id: 'subscription',
      label: '會員方案',
      icon: <ShieldUser className="w-6 h-6 text-neutral-800" />,
      bg: 'bg-primary-400',
      onClick: () => onNavigate('subscription'),
    },
    {
      id: 'purchase-history',
      label: '購買紀錄',
      icon: <ClipboardClock className="w-6 h-6 text-neutral-800" />,
      bg: 'bg-primary-300',
      onClick: () => onNavigate('purchase-history'),
    },
    {
      id: 'line-binding',
      label: 'LINE綁定',
      icon: <UserRoundCheck className="w-6 h-6 text-neutral-800" />,
      bg: 'bg-primary-200',
      onClick: () => onNavigate('line-binding'),
    },
    {
      id: 'consumption-reasons',
      label: '消耗原因',
      icon: <Bubbles className="w-6 h-6 text-neutral-800" />,
      bg: 'bg-primary-100',
      onClick: () => onNavigate('consumption-reason'), // Typo in key: keeping consistant with next steps
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 group"
          >
            {/* Dynamic background color usage */}
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              action.bg
            )}>
              {action.icon}
            </div>
            <span className="text-[12px] font-semibold text-neutral-700">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
