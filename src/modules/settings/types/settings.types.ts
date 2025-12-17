import type { User } from '@/modules/auth/types/index';

// Re-export types from auth module
export type { 
  CookingFrequency, 
  PrepTime, 
  SeasoningLevel, 
  DietaryRestriction, 
  DietaryPreference 
} from '@/modules/auth/types/index';

// UserProfile is essentially User, but we might want to keep the alias for compatibility or extend it
export type UserProfile = User;

export type QuickActionItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  onClick?: () => void;
};
