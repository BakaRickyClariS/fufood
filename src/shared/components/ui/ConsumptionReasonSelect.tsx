import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/shared/components/ui/select';
import { X } from 'lucide-react';
import type { ConsumptionReason } from '@/modules/recipe/types';

interface ConsumptionReasonSelectProps {
  value: ConsumptionReason[];
  onChange: (value: ConsumptionReason[]) => void;
  customReason: string;
  onCustomReasonChange: (value: string) => void;
}

const REASON_OPTIONS: { value: ConsumptionReason; label: string }[] = [
  { value: 'recipe_consumption', label: '食譜消耗' },
  { value: 'duplicate', label: '重複購買' },
  { value: 'short_shelf', label: '保存時間太短' },
  { value: 'bought_too_much', label: '買太多' },
  { value: 'custom', label: '自訂' },
];

export const ConsumptionReasonSelect: React.FC<
  ConsumptionReasonSelectProps
> = ({ value, onChange, customReason, onCustomReasonChange }) => {
  const handleSelect = (selectedValue: ConsumptionReason) => {
    if (!value.includes(selectedValue)) {
      onChange([...value, selectedValue]);
    }
  };

  const handleRemove = (reasonToRemove: ConsumptionReason) => {
    onChange(value.filter((r) => r !== reasonToRemove));
    if (reasonToRemove === 'custom') {
      onCustomReasonChange('');
    }
  };

  const getLabel = (r: ConsumptionReason) =>
    REASON_OPTIONS.find((opt) => opt.value === r)?.label || '自訂';

  // Determine if we should show the custom input (if 'custom' is selected)
  // For 'custom', we treat it as a selected tag.
  // The input should probably be separate or conditionally shown.
  // Design: "Select Custom then type to add" -> Implicitly means type into a field.
  // Current design: Tags inside.
  // Let's make the Trigger contain the tags.

  return (
    <div className="space-y-2">
      <Select
        onValueChange={(v) => handleSelect(v as ConsumptionReason)}
        value=""
      >
        <SelectTrigger className="w-full bg-white border border-neutral-200 rounded-lg min-h-10 h-auto py-2 px-3">
          <div className="flex flex-wrap gap-2 w-full items-center">
            {value.length > 0 ? (
              value.map((reason) => {
                const isCustom = reason === 'custom';
                return (
                  <span
                    key={reason}
                    className="inline-flex items-center gap-1 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                    onPointerDown={(e) => e.stopPropagation()} // Prevent opening select when clicking tag
                    onClick={(e) => {
                      e.stopPropagation();
                      // Focus input if clicking the tag container
                      if (isCustom) {
                        const input = e.currentTarget.querySelector('input');
                        input?.focus();
                      }
                    }}
                  >
                    {!isCustom && getLabel(reason)}

                    {isCustom && (
                      <input
                        value={customReason}
                        onChange={(e) => onCustomReasonChange(e.target.value)}
                        maxLength={10}
                        placeholder=""
                        style={{
                          width: `${Math.max(2, customReason.length)}em`,
                        }}
                        className="bg-transparent border-none outline-none text-white placeholder:text-white/70 h-5 active:border-none focus:border-none ring-0 focus:ring-0 min-w-[2em] text-center"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(reason);
                      }}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors ml-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                );
              })
            ) : (
              <span className="text-muted-foreground text-sm">
                填入消耗原因...
              </span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="z-200">
          {REASON_OPTIONS.filter((opt) => !value.includes(opt.value)).map(
            (option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
