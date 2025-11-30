import React from 'react';
import type {
  UseFormRegister,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { ChevronDown } from 'lucide-react';

type Option = {
  value: string;
  label: string;
};

type FormSelectProps<T extends FieldValues> =
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    name: Path<T>;
    options: Option[];
    register: UseFormRegister<T>;
    rules?: RegisterOptions<T>;
    error?: string;
    className?: string;
  };

const FormSelect = <T extends FieldValues>({
  label,
  name,
  options,
  register,
  rules,
  error,
  className = '',
  ...props
}: FormSelectProps<T>) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label htmlFor={name} className="text-sm font-medium text-slate-500">
      {label}
    </label>
    <div className="relative">
      <select
        id={name}
        {...register(name, rules)}
        className={`w-full px-4 py-3 rounded-xl border appearance-none bg-white ${
          error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-slate-200 focus:ring-slate-200'
        } focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium`}
        {...props}
      >
        <option value="" disabled>
          請選擇
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        size={20}
      />
    </div>
    {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
  </div>
);

export default FormSelect;
