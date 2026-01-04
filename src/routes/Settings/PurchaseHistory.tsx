import { useState, useEffect } from 'react';
import SettingsModalLayout from '@/modules/settings/components/SettingsModalLayout';
import { ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';

const PURCHASE_HISTORY_KEY = 'fufood_mock_orders';

type Order = {
  id: string;
  date: string;
  item: string;
  amount: string;
  status: string;
};

type PurchaseHistoryProps = {
  isOpen: boolean;
  onClose: () => void;
};

const PurchaseHistory = ({ isOpen, onClose }: PurchaseHistoryProps) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(PURCHASE_HISTORY_KEY);
      if (stored) {
        try {
          const newOrders = JSON.parse(stored);
          setOrders(newOrders);
        } catch (e) {
          console.error('Failed to parse mock orders', e);
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    }
  }, [isOpen]);

  return (
    <SettingsModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title="購買紀錄"
    >

      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-800 text-sm">
                    {order.item}
                  </h3>
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
    </SettingsModalLayout>
  );
};

export default PurchaseHistory;
