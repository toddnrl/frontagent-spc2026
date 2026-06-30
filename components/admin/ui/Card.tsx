import type { HTMLAttributes, ReactNode } from "react";

const cardSizeClasses = {
  sm: "rounded-[20px] p-4",
  md: "rounded-[24px] p-5",
  lg: "rounded-[28px] p-6",
} as const;

export function Card({
  size = "lg",
  className = "",
  children,
  ...rest
}: {
  size?: keyof typeof cardSizeClasses;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <section className={`border border-gray-200 bg-white ${cardSizeClasses[size]} ${className}`} {...rest}>
      {children}
    </section>
  );
}
