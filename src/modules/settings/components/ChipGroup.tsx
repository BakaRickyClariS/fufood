import SelectableChip from './SelectableChip';

type Option = {
  value: string;
  label: string;
};

type ChipGroupProps = {
  options: Option[];
  value?: string | string[]; // Single value or array
  onChange: (value: string | string[] | undefined) => void;
  multiple?: boolean;
  className?: string;
};

const ChipGroup = ({
  options,
  value,
  onChange,
  multiple = false,
  className,
}: ChipGroupProps) => {
  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      // Single select: toggle logic
      if (value === optionValue) {
        // Deselect if clicking the currently selected item
        onChange(undefined);
      } else {
        onChange(optionValue);
      }
    }
  };

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {options.map((option) => {
        const isSelected = multiple
          ? Array.isArray(value) && value.includes(option.value)
          : value === option.value;

        return (
          <SelectableChip
            key={option.value}
            label={option.label}
            selected={isSelected}
            onClick={() => handleSelect(option.value)}
          />
        );
      })}
    </div>
  );
};

export default ChipGroup;
