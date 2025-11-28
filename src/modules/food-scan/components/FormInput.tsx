import React from 'react';
import type {
  UseFormRegister,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';

type FormInputProps<T extends FieldValues> =
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: Path<T>;
    register: UseFormRegister<T>;
    rules?: RegisterOptions<T>;
    error?: string;
    className?: string;
  };

const FormInput = <T extends FieldValues>({
  label,
  name,
  register,
  rules,
  error,
  className = '',
  ...props
}: FormInputProps<T>) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label htmlFor={name} className="text-sm font-medium text-slate-500">
      {label}
    </label>
    <input
      id={name}
      {...register(name, rules)}
      className={`w-full px-4 py-3 rounded-xl border ${
        error
          ? 'border-red-500 focus:ring-red-200'
          : 'border-slate-200 focus:ring-slate-200'
      } focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium placeholder:text-slate-300`}
      {...props}
    />
    {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
  </div>
);

export default FormInput;
