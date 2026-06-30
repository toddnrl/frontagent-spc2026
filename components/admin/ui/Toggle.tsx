"use client";

export function Toggle({
  enabled,
  onChange,
  disabled = false,
  size = "md",
  className = "",
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const dimensions =
    size === "sm"
      ? {
          track: "h-5 w-9 p-0.5",
          thumb: "h-4 w-4",
          translate: "translate-x-4",
        }
      : {
          track: "h-7 w-12 p-1",
          thumb: "h-5 w-5",
          translate: "translate-x-5",
        };

  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      className={`flex items-center rounded-full transition-colors disabled:opacity-40 ${
        dimensions.track
      } ${enabled ? "bg-blue-500" : "bg-gray-300"} ${className}`}
    >
      <span
        className={`rounded-full bg-white shadow-sm transition-transform ${dimensions.thumb} ${
          enabled ? dimensions.translate : ""
        }`}
      />
    </button>
  );
}
