import { Outlet } from 'react-router-dom';
import TopNav from './components/layout/TopNav';
import BottomNav from './components/layout/BottomNav';

const Layout = () => {
  return (
    <>
      <TopNav />
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
};

export default Layout;
