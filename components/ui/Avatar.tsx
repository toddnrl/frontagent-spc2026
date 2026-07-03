export function Avatar({
  label,
  size = "md",
}: {
  label: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "h-6 w-6 text-xs" : size === "lg" ? "h-11 w-11" : "h-8 w-8";

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-blue-200 font-bold text-gray-700 ${sizeClass}`}
    >
      {label}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
    </span>
  );
}
