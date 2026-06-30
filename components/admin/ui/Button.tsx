import type { ButtonHTMLAttributes, ReactNode } from "react";

const buttonVariantClasses = {
  primary: "bg-[#3182F6] text-white hover:bg-[#1b64da]",
  dark: "bg-black text-white hover:bg-gray-800",
  secondary: "bg-[#f2f2f2] text-gray-600",
  danger: "bg-red-50 text-red-500",
  ghost: "border border-gray-200 bg-white text-gray-900",
} as const;

const buttonSizeClasses = {
  sm: "px-3 py-1.5 text-[12px]",
  md: "px-3.5 py-2 text-[13px]",
  lg: "px-4 py-2 text-[13px]",
} as const;

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...rest
}: {
  variant?: keyof typeof buttonVariantClasses;
  size?: keyof typeof buttonSizeClasses;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`flex items-center gap-2 rounded-full font-bold transition-colors disabled:opacity-40 ${buttonVariantClasses[variant]} ${buttonSizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
