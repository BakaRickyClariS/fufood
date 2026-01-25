import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  'fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 animate-in slide-in-from-top-5 fade-in',
  {
    variants: {
      type: {
        success: 'bg-white border-green-200 text-green-800',
        error: 'bg-white border-red-200 text-red-800',
        info: 'bg-white border-blue-200 text-blue-800',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  },
);

export type ToastType = VariantProps<typeof toastVariants>['type'];

export type ToastProps = VariantProps<typeof toastVariants> & {
  message: string;
  onClose: () => void;
  duration?: number;
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3000,
}) => {
  const Icon = icons[type || 'info'];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={cn(toastVariants({ type }))}>
      <Icon
        size={20}
        className={cn(
          type === 'success' && 'text-green-500',
          type === 'error' && 'text-red-500',
          type === 'info' && 'text-blue-500',
        )}
      />
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
      >
        <X size={16} className="opacity-50" />
      </button>
    </div>
  );
};
