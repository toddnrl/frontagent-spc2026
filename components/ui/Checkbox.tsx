"use client";

import { useId, type ReactNode } from "react";

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  boxed = false,
  className = "",
  id: idProp,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  boxed?: boolean;
  className?: string;
  id?: string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;

  const field = (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`.trim()}
    >
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="flex h-5 w-5 items-center justify-center rounded-[6px] border-2 border-gray-300 bg-white transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500">
          <svg
            viewBox="0 0 12 10"
            className={`h-2.5 w-2.5 text-white transition-opacity ${checked ? "opacity-100" : "opacity-0"}`}
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 5.2 4.2 8.4 11 1.4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      {(label || description) && (
        <span className="min-w-0 flex-1">
          {label ? <span className="block text-[13px] font-extrabold text-gray-900">{label}</span> : null}
          {description ? (
            <span className="mt-0.5 block text-[12px] font-semibold leading-relaxed text-gray-500">
              {description}
            </span>
          ) : null}
        </span>
      )}
    </label>
  );

  if (!boxed) return field;

  return <div className="rounded-[16px] bg-[#f7f7f7] px-4 py-3.5">{field}</div>;
}
