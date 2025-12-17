import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import type { UserProfile } from '@/modules/settings/types/settings.types';
import { getUserAvatarUrl } from '@/shared/utils/avatarUtils';

// Components
import ProfileSection from '@/modules/settings/components/ProfileSection';
import DietaryPreferenceTags from '@/modules/settings/components/DietaryPreferenceTags';
import QuickActions from '@/modules/settings/components/QuickActions';
import OtherSettingsList from '@/modules/settings/components/OtherSettingsList';
import LogoutSection from '@/modules/settings/components/LogoutSection';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Transform auth User to UserProfile type
  const userProfile: UserProfile = {
    ...user,
    name: user?.displayName || user?.name || '使用者',
    avatar: getUserAvatarUrl(user),
    // Ensure default empty object if undefined, to prevent errors in child components
    dietaryPreference: user?.dietaryPreference || {
       cookingFrequency: '3-4',
       prepTime: '15-30',
       seasoningLevel: 'moderate',
       restrictions: ['none'],
    }
  } as UserProfile;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/auth/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-4">
        <ProfileSection user={userProfile} />
        
        <DietaryPreferenceTags preference={userProfile.dietaryPreference} />
        
        <QuickActions />
        
        <OtherSettingsList />
        
        {/* Pass user email if available in User object, assuming user.email exists */}
        <LogoutSection 
          email={user?.email || 'jojo@gmail.com'} 
          onLogout={handleLogout} 
          isLoggingOut={isLoggingOut} 
        />
      </div>
    </div>
  );
};

export default SettingsPage;
