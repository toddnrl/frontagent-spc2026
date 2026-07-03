export type OverlayTone = "admin" | "marketing";

export type OverlaySize = "sm" | "md" | "lg" | "marketing";

export const overlayToneClasses: Record<
  OverlayTone,
  { overlay: string; center: string; panel: string; closeButton: string }
> = {
  admin: {
    overlay: "fixed inset-0 z-50 bg-black/20",
    center: "fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none",
    panel: "relative w-full rounded-[20px] bg-white p-5 shadow-2xl",
    closeButton:
      "absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200",
  },
  marketing: {
    overlay: "fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]",
    center: "fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none",
    panel:
      "relative w-full rounded-[24px] bg-white p-10 py-14 shadow-[0_30px_80px_-20px_rgba(20,30,50,0.35)]",
    closeButton:
      "absolute right-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#9aa1ad] transition-colors duration-150 hover:bg-[#f0f2f5] hover:text-[#16191f]",
  },
};

export const overlaySizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  marketing: "max-w-[400px]",
} as const;

export function getOverlayContentClassName({
  tone = "admin",
  size = "md",
  panelClassName = "",
}: {
  tone?: OverlayTone;
  size?: OverlaySize;
  panelClassName?: string;
}) {
  const toneClasses = overlayToneClasses[tone];
  const resolvedSize = tone === "marketing" ? overlaySizeClasses.marketing : overlaySizeClasses[size];

  return [
    "pointer-events-auto w-full focus:outline-none",
    toneClasses.panel,
    resolvedSize,
    panelClassName,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getOverlayCenterClassName({
  tone = "admin",
}: {
  tone?: OverlayTone;
}) {
  return overlayToneClasses[tone].center;
}

export function getOverlayBackdropClassName({
  tone = "admin",
  overlayClassName = "",
}: {
  tone?: OverlayTone;
  overlayClassName?: string;
}) {
  return [overlayToneClasses[tone].overlay, overlayClassName].filter(Boolean).join(" ");
}

export function DialogCloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 3l10 10M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
