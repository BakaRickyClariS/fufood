import HeroCard from '@/features/inventory/components/ui/other/HeroSection';
import TabsSection from '@/features/inventory/components/layout/TabsSection';
import MemberList from '@/features/inventory/components/layout/MemberList';

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
