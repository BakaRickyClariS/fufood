import HeroCard from '@/components/layout/HeroCard';
import TabsSection from '@/components/layout/inventory/TabsSection';
import MemberList from '@/components/layout/MemberList';
// import { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';

const Inventory: React.FC = () => {
  // const location = useLocation();
  // const isMember = location.pathname === '/';
  // useEffect(() => {
  //   if (isMember) {
  //     document.body.classList.add('body-dashboard-bg');
  //   } else {
  //     document.body.classList.remove('body-dashboard-bg');
  //   }
  //   return () => {
  //     document.body.classList.remove('body-dashboard-bg');
  //   };
  // }, [isMember]);
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
