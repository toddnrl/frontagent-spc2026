import { ChevronDown, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../../ui";
import type { NextStepMode } from "./nodeHelpers";

export function PanelSection({
  icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-gray-100">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f3f4f6] text-gray-700">
            {icon}
          </span>
          <span className="truncate text-[16px] font-extrabold text-gray-900">{title}</span>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}

export function PanelLargeTextArea({
  value,
  onChange,
  placeholder,
  rows,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      className="w-full resize-none bg-transparent text-[15px] font-semibold leading-[1.65] text-gray-800 outline-none placeholder:text-gray-300"
      placeholder={placeholder}
    />
  );
}

export function PanelInlineInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}) {
  return (
    <label className="block rounded-[14px] bg-[#f7f7f7] px-4 py-3">
      <span className="mb-1 block text-[11px] font-extrabold text-gray-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full bg-transparent text-[14px] font-bold text-gray-800 outline-none placeholder:text-gray-300"
      />
    </label>
  );
}

export function PanelInlineSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  return (
    <label className="block rounded-[14px] bg-[#f7f7f7] px-4 py-3">
      <span className="mb-1 block text-[11px] font-extrabold text-gray-400">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none bg-transparent pr-8 text-[14px] font-bold text-gray-800 outline-none disabled:text-gray-400"
          disabled={options.length === 0}
        >
          <option value="">{options.length === 0 ? "연결 가능한 노드 없음" : (placeholder ?? "선택")}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </label>
  );
}

export function NextStepModePicker({
  value,
  onChange,
}: {
  value: NextStepMode;
  onChange: (value: NextStepMode) => void;
}) {
  const options: Array<{
    value: NextStepMode;
    label: string;
    description: string;
  }> = [
    { value: "single", label: "단일", description: "다음 노드 하나로 이동" },
    { value: "branch", label: "분기", description: "조건에 따라 여러 단계로 이동" },
    { value: "end", label: "종료", description: "이 노드에서 태스크 종료" },
  ];
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <label className="block rounded-[16px] bg-[#f7f7f7] px-4 py-3">
      <span className="mb-1 block text-[11px] font-extrabold text-gray-400">이동 방식</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as NextStepMode)}
          className="w-full appearance-none bg-transparent pr-8 text-[14px] font-extrabold text-gray-900 outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      <div className="mt-2 text-[12px] font-bold leading-relaxed text-gray-400">
        {selected.description}
      </div>
    </label>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-bold text-gray-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[12px] bg-[#f7f7f7] px-4 py-3 text-[14px] font-semibold outline-none"
        placeholder={placeholder}
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-bold text-gray-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full resize-none rounded-[12px] bg-[#f7f7f7] px-4 py-3 text-[14px] font-semibold leading-relaxed outline-none"
        placeholder={placeholder}
      />
    </label>
  );
}

export function PageHeader({
  title,
  description,
  action,
  onAction,
  actionVariant = "secondary",
  actionDisabled = false,
  actionIcon = <Plus className="h-4 w-4" />,
}: {
  title: string;
  description: string;
  action: string;
  onAction?: () => void;
  actionVariant?: "primary" | "secondary";
  actionDisabled?: boolean;
  actionIcon?: ReactNode;
}) {
  return (
    <div className="mb-7 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[30px] font-bold">{title}</h1>
        <p className="mt-2 text-[15px] font-medium text-gray-500">{description}</p>
      </div>
      <Button variant={actionVariant} size="lg" onClick={onAction} disabled={actionDisabled}>
        {actionIcon}
        {action}
      </Button>
    </div>
  );
}
