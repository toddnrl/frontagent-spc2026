"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import {
  DialogCloseIcon,
  getOverlayBackdropClassName,
  getOverlayCenterClassName,
  getOverlayContentClassName,
  overlayToneClasses,
  type OverlaySize,
  type OverlayTone,
} from "./overlay";

export function Dialog({
  open,
  onClose,
  children,
  tone = "admin",
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = false,
  panelClassName = "",
  overlayClassName = "",
  titleId,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  tone?: OverlayTone;
  size?: OverlaySize;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  panelClassName?: string;
  overlayClassName?: string;
  titleId?: string;
}) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  return (
    <RadixDialog.Root open={open} onOpenChange={handleOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={getOverlayBackdropClassName({ tone, overlayClassName })} />
        <div className={getOverlayCenterClassName({ tone })}>
          <RadixDialog.Content
            aria-labelledby={titleId}
            className={getOverlayContentClassName({ tone, size, panelClassName })}
            onPointerDownOutside={closeOnOverlayClick ? undefined : (event) => event.preventDefault()}
            onInteractOutside={closeOnOverlayClick ? undefined : (event) => event.preventDefault()}
          >
            {showCloseButton ? (
              <RadixDialog.Close asChild>
                <button
                  type="button"
                  className={overlayToneClasses[tone].closeButton}
                  aria-label="닫기"
                >
                  <DialogCloseIcon />
                </button>
              </RadixDialog.Close>
            ) : null}
            {children}
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export function DialogHeader({
  title,
  description,
  onClose,
  titleId: titleIdProp,
  className = "",
}: {
  title: ReactNode;
  description?: ReactNode;
  onClose?: () => void;
  titleId?: string;
  className?: string;
}) {
  const autoTitleId = useId();
  const titleId = titleIdProp ?? autoTitleId;

  return (
    <div className={`mb-4 flex items-start justify-between gap-3 ${className}`.trim()}>
      <div className="min-w-0">
        <RadixDialog.Title id={titleId} className="text-[18px] font-extrabold text-gray-900">
          {title}
        </RadixDialog.Title>
        {description ? (
          <RadixDialog.Description className="mt-1 text-[13px] font-semibold leading-relaxed text-gray-500">
            {description}
          </RadixDialog.Description>
        ) : null}
      </div>
      {onClose ? (
        <RadixDialog.Close asChild>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </RadixDialog.Close>
      ) : null}
    </div>
  );
}

export function DialogBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function DialogFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex justify-end gap-2 pt-2 ${className}`.trim()}>{children}</div>;
}

const dialogActionButtonClass = {
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#f2f2f2] px-3.5 py-2 text-[13px] font-bold text-gray-600 transition-colors hover:bg-[#e8e8e8] disabled:opacity-40",
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#3182F6] px-3.5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#1b64da] disabled:opacity-40",
  dark: "inline-flex items-center justify-center gap-2 rounded-full bg-black px-3.5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-40",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-full bg-red-50 px-3.5 py-2 text-[13px] font-bold text-red-500 transition-colors hover:bg-red-100 disabled:opacity-40",
} as const;

export function DialogActions({
  isSubmitting = false,
  submitLabel,
  cancelLabel = "취소",
  onClose,
  onSubmit,
  submitVariant = "primary",
  closeDisabled,
  submitDisabled,
}: {
  isSubmitting?: boolean;
  submitLabel: string;
  cancelLabel?: string;
  onClose: () => void;
  onSubmit: () => void;
  submitVariant?: keyof typeof dialogActionButtonClass;
  closeDisabled?: boolean;
  submitDisabled?: boolean;
}) {
  return (
    <DialogFooter>
      <RadixDialog.Close asChild>
        <button
          type="button"
          className={dialogActionButtonClass.secondary}
          disabled={isSubmitting || closeDisabled}
          onClick={onClose}
        >
          {cancelLabel}
        </button>
      </RadixDialog.Close>
      <button
        type="button"
        className={dialogActionButtonClass[submitVariant]}
        onClick={onSubmit}
        disabled={isSubmitting || submitDisabled}
      >
        {isSubmitting ? "처리중" : submitLabel}
      </button>
    </DialogFooter>
  );
}
