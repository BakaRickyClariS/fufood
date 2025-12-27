import { useNavigate, useParams, useLocation } from 'react-router-dom';
import TabsSection from '@/modules/inventory/components/layout/TabsSection';
import FoodDetailModal from '@/modules/inventory/components/ui/modal/FoodDetailModal';
import { useInventoryItemQuery } from '@/modules/inventory/api';

const Inventory: React.FC = () => {
  const { itemId } = useParams(); // Keep for backward compatibility or direct link if needed, but primary is state
  const location = useLocation();
  const navigate = useNavigate();

  // 優先使用 state 中的 itemId，其次是 URL params
  const targetItemId =
    (location.state as { openItemId?: string })?.openItemId || itemId;

  const { data: itemData, refetch } = useInventoryItemQuery(targetItemId || '');

  const handleCloseModal = () => {
    // 清除 state 並留在當前頁面
    navigate(location.pathname, { replace: true, state: {} });
  };

  return (
    <>
      <TabsSection />
      {targetItemId && itemData?.data?.item && (
        <FoodDetailModal
          item={itemData.data.item}
          isOpen={true}
          onClose={handleCloseModal}
          onItemUpdate={refetch}
        />
      )}
    </>
  );
};

export default Inventory;
