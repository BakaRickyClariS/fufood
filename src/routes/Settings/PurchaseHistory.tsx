import { useNavigate } from 'react-router-dom';
import ComponentHeader from '@/modules/settings/components/SimpleHeader';
import { ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';

const MOCK_ORDERS = [
  {
    id: 'ORD-20231201-001',
    date: '2023/12/01',
    item: '進階版會員 (月費)',
    amount: 'NT$90',
    status: 'completed',
  },
  {
    id: 'ORD-20231101-001',
    date: '2023/11/01',
    item: '進階版會員 (月費)',
    amount: 'NT$90',
    status: 'completed',
  },
];

const PurchaseHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <ComponentHeader title="購買紀錄" onBack={() => navigate(-1)} />

      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-4">
        {MOCK_ORDERS.length > 0 ? (
          MOCK_ORDERS.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-800 text-sm">{order.item}</h3>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {order.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-neutral-900">{order.amount}</div>
                <div className="text-xs text-green-600 flex items-center justify-end gap-0.5 mt-0.5">
                   <CheckCircle2 className="w-3 h-3" /> 完成
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-neutral-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>尚無購買紀錄</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
