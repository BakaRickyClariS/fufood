```typescript
import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';

type FormTagInputProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  error?: string;
  placeholder?: string;
  rules?: object;
  maxTags?: number;
};

const FormTagInput = <T extends FieldValues>({
  label,
  name,
  control,
  error,
  placeholder = 'Type and press Enter...',
  rules,
  maxTags = 10,
}: FormTagInputProps<T>) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    currentTags: string[],
    onChange: (value: string[]) => void,
  ) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedInput = inputValue.trim();

      if (trimmedInput && !currentTags.includes(trimmedInput)) {
        if (currentTags.length >= maxTags) return;
        onChange([...currentTags, trimmedInput]);
        setInputValue('');
      } else if (trimmedInput === '') {
        // Optional: clear input if it's just spaces
        setInputValue('');
      }
    } else if (
      e.key === 'Backspace' &&
      inputValue === '' &&
      currentTags.length > 0
    ) {
      // Remove last tag on backspace if input is empty
      onChange(currentTags.slice(0, -1));
    }
  };

  const removeTag = (
    indexToRemove: number,
    currentTags: string[],
    onChange: (value: string[]) => void,
  ) => {
    onChange(currentTags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { value = [], onChange, onBlur } }) => {
          // Ensure value is always an array
          const tags = Array.isArray(value) ? value : [];

          return (
            <div
              className={`min-h-[42px] w-full px-3 py-2 bg-slate-50 border rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all flex flex-wrap gap-2 items-center ${
                error
                  ? 'border-red-500 focus-within:ring-red-200'
                  : 'border-slate-200'
              }`}
            >
              {tags.map((tag: string, index: number) => (
                <span
                  key={`${tag}-${index}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm bg-primary-50 text-primary-700 border border-primary-100"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index, tags, onChange)}
                    className="ml-1.5 hover:text-primary-900 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                id={name}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, tags, onChange)}
                onBlur={() => {
                  onBlur();
                  // Optional: add tag on blur if there's content?
                  // Generally better to strictly require Enter to avoid accidental tags
                }}
                placeholder={tags.length === 0 ? placeholder : ''}
                className="flex-1 min-w-[120px] bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-base"
                disabled={tags.length >= maxTags}
              />
            </div>
          );
        }}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormTagInput;
