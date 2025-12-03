import { Outlet } from 'react-router-dom';

export const RecipeLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet />
    </div>
  );
};
