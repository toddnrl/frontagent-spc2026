"use client";

import { useId, type ReactNode } from "react";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "./Dialog";
import type { OverlaySize, OverlayTone } from "./overlay";

export function Modal({
  title,
  description,
  onClose,
  children,
  tone = "admin",
  size = "md",
  footer,
  panelClassName = "",
}: {
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  tone?: OverlayTone;
  size?: OverlaySize;
  footer?: ReactNode;
  panelClassName?: string;
}) {
  const titleId = useId();

  return (
    <Dialog open onClose={onClose} tone={tone} size={size} panelClassName={panelClassName} titleId={titleId}>
      <DialogHeader title={title} description={description} onClose={onClose} titleId={titleId} />
      <DialogBody>{children}</DialogBody>
      {footer}
    </Dialog>
  );
}

export { DialogActions as ModalActions, Dialog, DialogBody, DialogFooter, DialogHeader, DialogActions };
