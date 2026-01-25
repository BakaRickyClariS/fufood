import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Calendar } from 'lucide-react';

type FormDatePickerProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  error?: string;
  className?: string;
};

const FormDatePicker = <T extends FieldValues>({
  label,
  name,
  control,
  error,
  className = '',
}: FormDatePickerProps<T>) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label htmlFor={name} className="text-sm font-medium text-slate-500">
      {label}
    </label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="relative">
          <input
            type="date"
            id={name}
            {...field}
            className={`w-full px-4 py-3 pr-12 rounded-xl border appearance-none bg-white ${
              error
                ? 'border-red-500 focus:ring-red-200'
                : 'border-slate-200 focus:ring-slate-200'
            } focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
          />
          <Calendar
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={20}
          />
        </div>
      )}
    />
    {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
  </div>
);

export default FormDatePicker;
