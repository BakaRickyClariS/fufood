import HeroCard from '@/shared/components/layout/HeroCard';
import TabsSection from '@/features/inventory/components/TabsSection';
import MemberList from '@/shared/components/layout/MemberList';

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
