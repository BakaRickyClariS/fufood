import { LogOut } from 'lucide-react';

type LogoutSectionProps = {
  email?: string;
  onLogout: () => void;
  isLoggingOut?: boolean;
};

const LogoutSection = ({
  email,
  onLogout,
  isLoggingOut,
}: LogoutSectionProps) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
      {email && (
        <div className="text-base font-semibold text-neutral-800 px-1">{email}</div>
      )}
      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        className="w-full flex items-center justify-between px-1 py-1 text-primary-400 font-semibold hover:text-primary-500 disabled:opacity-50 transition-colors"
      >
        <span>{isLoggingOut ? '登出中...' : '登出'}</span>
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};

export default LogoutSection;
