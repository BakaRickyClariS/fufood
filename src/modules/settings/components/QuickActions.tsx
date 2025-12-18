import { useNavigate } from 'react-router-dom';
import { Crown, ShoppingBag, MessageCircle, Bell } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'subscription',
      label: '會員方案',
      icon: <Crown className="w-6 h-6 text-neutral-700" />,
      bg: 'bg-primary-100', // Example different color or just same
      onClick: () => navigate('/settings/subscription'),
    },
    {
      id: 'purchase-history',
      label: '購買紀錄',
      icon: <ShoppingBag className="w-6 h-6 text-neutral-700" />,
      onClick: () => navigate('/settings/purchase-history'), // Assuming route exists or will exist
    },
    {
      id: 'line-binding',
      label: 'LINE綁定',
      icon: <MessageCircle className="w-6 h-6 text-neutral-700" />,
      onClick: () => console.log('LINE Binding Clicked'), // To be implemented
    },
    {
      id: 'notifications',
      label: '推播通知',
      icon: <Bell className="w-6 h-6 text-neutral-700" />,
      onClick: () => navigate('/settings/notifications'),
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
            <div className="w-12 h-12 rounded-full bg-primary-100/50 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              {action.icon}
            </div>
            <span className="text-xs font-medium text-neutral-700">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
