import MemberList from '@/components/layout/MemberList';
import InventoryCategorySection from '@/components/layout/InventoryCategorySection';
import InventoryTabsSection from '@/components/layout/InventoryTabsSection';
const Inventory: React.FC = () => {
  return (
    <>
      <MemberList />
      <InventoryTabsSection />
      <InventoryCategorySection />
    </>
  );
};

export default Inventory;
