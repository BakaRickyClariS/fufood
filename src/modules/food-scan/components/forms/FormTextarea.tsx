import React from 'react';
import type {
  UseFormRegister,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';

type FormTextareaProps<T extends FieldValues> =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    name: Path<T>;
    register: UseFormRegister<T>;
    rules?: RegisterOptions<T>;
    error?: string;
    currentLength?: number;
    maxLength?: number;
    className?: string;
  };

const FormTextarea = <T extends FieldValues>({
  label,
  name,
  register,
  rules,
  error,
  currentLength = 0,
  maxLength,
  className = '',
  ...props
}: FormTextareaProps<T>) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label
      htmlFor={name}
      className="text-base font-bold text-slate-800 pl-1 border-l-4 border-red-400 leading-4 mb-2"
    >
      {label}
    </label>
    <div className="relative">
      <textarea
        id={name}
        {...register(name, rules)}
        maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-xl border ${
          error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-slate-200 focus:ring-slate-200'
        } focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium placeholder:text-slate-300 min-h-[100px] resize-none`}
        {...props}
      />
      {maxLength && (
        <div className="absolute bottom-3 right-3 text-xs text-slate-400">
          {currentLength}/{maxLength}
        </div>
      )}
    </div>
    {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
  </div>
);

export default FormTextarea;
