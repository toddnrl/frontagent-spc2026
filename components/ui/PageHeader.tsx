import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

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

export function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[15px] font-bold">
      {icon}
      {title}
    </div>
  );
}
