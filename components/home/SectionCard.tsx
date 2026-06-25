import type { ComponentProps } from "react";
import { motion } from "motion/react";

type SectionCardProps = ComponentProps<typeof motion.div> & {
  surface?: "white" | "dark" | "api";
  size?: "feature" | "section" | "compact" | "flush";
};

const surfaceClasses = {
  white: "bg-white sm:border-gray-100 sm:shadow-[0_4px_24px_rgb(0,0,0,0.02)]",
  dark: "bg-gray-900 sm:border-gray-800 sm:shadow-lg",
  api: "bg-[#212832] sm:border-white/5",
};

const sizeClasses = {
  feature: "rounded-[24px] sm:rounded-[32px] p-6 sm:p-10",
  section: "rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 md:p-12 lg:p-16",
  compact: "rounded-[20px] sm:rounded-[24px] p-6 sm:p-8",
  flush: "rounded-[24px] overflow-hidden",
};

export function SectionCard({
  surface = "white",
  size = "feature",
  className = "",
  ...props
}: SectionCardProps) {
  return (
    <motion.div
      className={[
        sizeClasses[size],
        surfaceClasses[surface],
        "sm:border",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
