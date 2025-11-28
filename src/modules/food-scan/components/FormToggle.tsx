import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

type FormToggleProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  className?: string;
};

const FormToggle = <T extends FieldValues>({
  label,
  name,
  control,
  className = '',
}: FormToggleProps<T>) => (
  <div className={`flex items-center justify-between ${className}`}>
    <label htmlFor={name} className="text-base font-bold text-slate-800">
      {label}
    </label>
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className={`w-12 h-7 rounded-full transition-colors relative ${
            value ? 'bg-red-400' : 'bg-slate-200'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              value ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      )}
    />
  </div>
);

export default FormToggle;
