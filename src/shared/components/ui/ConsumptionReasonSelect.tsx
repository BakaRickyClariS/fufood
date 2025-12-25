import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { X } from 'lucide-react';
import type { ConsumptionReason } from '@/modules/recipe/types';

interface ConsumptionReasonSelectProps {
  value: ConsumptionReason[];
  onChange: (value: ConsumptionReason[]) => void;
  customReason: string;
  onCustomReasonChange: (value: string) => void;
}

const REASON_OPTIONS: { value: ConsumptionReason; label: string }[] = [
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
  };

  const getLabel = (r: ConsumptionReason) =>
    REASON_OPTIONS.find((opt) => opt.value === r)?.label || '自訂';

  return (
    <div className="space-y-2">
      {/* Selected Reasons Pills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((reason) => (
            <span
              key={reason}
              className="inline-flex items-center gap-1 bg-[#EE5D50] text-white px-2 py-1 rounded-full text-sm"
            >
              {getLabel(reason)}
              <button
                type="button"
                onClick={() => handleRemove(reason)}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                aria-label={`移除 ${getLabel(reason)}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <Select
        onValueChange={(v) => handleSelect(v as ConsumptionReason)}
        // Use key to force re-mounting if needed, or better, pass undefined to value if we want it uncontrolled for display but we are using it as trigger.
        // Radix UI Select value prop: "The controlled value of the select."
        // If we want it to be empty/reset, we should pass a value that doesn't match?
        // Let's passed undefined.
        value={undefined}
      >
        <SelectTrigger className="w-full bg-white border border-neutral-200 rounded-lg">
          <SelectValue placeholder="填入消耗原因..." />
        </SelectTrigger>
        <SelectContent>
          {REASON_OPTIONS.filter((opt) => !value.includes(opt.value)).map(
            (option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      {/* Custom Reason Input */}
      {value.includes('custom') && (
        <Input
          value={customReason}
          onChange={(e) => onCustomReasonChange(e.target.value)}
          maxLength={10}
          placeholder="請輸入原因 (最多10字)"
          className="mt-2"
        />
      )}
    </div>
  );
};
