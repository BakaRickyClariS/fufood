import HeroCard from '@/modules/inventory/components/ui/other/HeroSection';
import TabsSection from '@/modules/inventory/components/layout/TabsSection';
import MemberList from '@/modules/inventory/components/layout/MemberList';

const Inventory: React.FC = () => {
  return (
    <>
      <HeroCard>
        <MemberList />
      </HeroCard>
      <TabsSection />
    </>
  );
};

export default Inventory;
