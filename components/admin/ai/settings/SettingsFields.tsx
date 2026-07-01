import type { InputHTMLAttributes } from "react";

export type SettingsOption = string | { value: string; label: string };

export function SettingsInput({
  label,
  value,
  onChange,
  type = "text",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "value">) {
  return (
    <label className="block rounded-[18px] bg-[#f7f7f7] p-4">
      <span className="mb-2 block text-[12px] font-bold text-gray-400">{label}</span>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-[15px] font-bold outline-none placeholder:text-gray-300 disabled:opacity-50"
        {...rest}
      />
    </label>
  );
}

export function SettingsSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: SettingsOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  const hasCurrentValue = normalizedOptions.some((option) => option.value === value);
  const renderedOptions =
    value && !hasCurrentValue
      ? [{ value, label: `현재 저장값: ${value}` }, ...normalizedOptions]
      : normalizedOptions;

  return (
    <label className="block rounded-[18px] bg-[#f7f7f7] p-4">
      <span className="mb-2 block text-[12px] font-bold text-gray-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full bg-transparent text-[15px] font-bold outline-none disabled:opacity-50"
      >
        {renderedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {value && !hasCurrentValue && (
        <div className="mt-2 text-[11px] font-bold text-orange-500">
          권장 목록 밖 모델입니다. 저장 전 목록의 모델로 변경하세요.
        </div>
      )}
    </label>
  );
}
