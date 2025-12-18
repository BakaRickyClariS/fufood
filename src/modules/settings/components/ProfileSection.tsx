import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { UserProfile } from '@/modules/settings/types/settings.types';

type ProfileSectionProps = {
  user: UserProfile;
};

const ProfileSection = ({ user }: ProfileSectionProps) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-100">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary-50 flex items-center justify-center text-primary-400 text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-neutral-800">{user.name}</h2>
          <Link
            to="/settings/profile"
            className="flex items-center text-primary-500 text-sm font-medium mt-1 hover:text-primary-600"
          >
            個人檔案 <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
