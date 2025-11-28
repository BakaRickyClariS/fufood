import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Plus, Minus } from 'lucide-react';

type FormQuantityProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  min?: number;
  max?: number;
  className?: string;
};

const FormQuantity = <T extends FieldValues>({
  label,
  name,
  control,
  min = 1,
  max = 99,
  className = '',
}: FormQuantityProps<T>) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <label htmlFor={name} className="text-base font-bold text-slate-800">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange(Math.max(min, (value || 0) - 1))}
              disabled={value <= min}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={16} strokeWidth={3} />
            </button>
            <span className="text-lg font-bold text-slate-800 min-w-[20px] text-center">
              {value}
            </span>
            <button
              type="button"
              onClick={() => onChange(Math.min(max, (value || 0) + 1))}
              disabled={value >= max}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default FormQuantity;
