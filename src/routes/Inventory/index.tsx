import HeroCard from '@/components/layout/HeroCard';
import TabsSection from '@/components/layout/inventory/TabsSection';
import MemberList from '@/components/layout/MemberList';

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
