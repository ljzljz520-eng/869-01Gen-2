import * as React from "react";
import { Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeVariant = "pending" | "approved" | "rejected" | "warning";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showIcon?: boolean;
}

const variantConfig: Record<
  BadgeVariant,
  { wrapper: string; icon: React.ReactNode; label: string }
> = {
  pending: {
    wrapper:
      "bg-warning-50 text-warning-700 border-warning-200",
    icon: <Clock className="w-3.5 h-3.5" />,
    label: "待审核",
  },
  approved: {
    wrapper:
      "bg-primary-50 text-primary-700 border-primary-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: "已通过",
  },
  rejected: {
    wrapper:
      "bg-danger-50 text-danger-700 border-danger-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: "已驳回",
  },
  warning: {
    wrapper:
      "bg-secondary-50 text-secondary-700 border-secondary-200",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    label: "异常",
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "pending",
  showIcon = true,
  className,
  children,
  ...props
}) => {
  const config = variantConfig[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm",
        config.wrapper,
        className
      )}
      {...props}
    >
      {showIcon && config.icon}
      <span>{children ?? config.label}</span>
    </span>
  );
};

Badge.displayName = "Badge";
