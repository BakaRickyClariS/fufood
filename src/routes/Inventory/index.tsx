import HeroCard from '@/components/layout/HeroCard';
import TabsSection from '@/components/layout/inventory/TabsSection';
import MemberList from '@/components/layout/MemberList';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Inventory: React.FC = () => {
  const location = useLocation();
  const isMainInventory = location.pathname === '/inventory';
  useEffect(() => {}, [isMainInventory]);
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
