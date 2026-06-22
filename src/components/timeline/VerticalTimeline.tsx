import * as React from "react";
import { CheckCircle2, Clock, AlertCircle, FileText, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type TimelineNodeType =
  | "success"
  | "pending"
  | "warning"
  | "info"
  | "error"
  | "default";

export interface VerticalTimelineItem {
  id: string | number;
  title: string;
  description?: React.ReactNode;
  time?: string;
  type?: TimelineNodeType;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  active?: boolean;
}

export interface VerticalTimelineProps {
  items: VerticalTimelineItem[];
  className?: string;
  animate?: boolean;
}

const nodeConfig: Record<
  TimelineNodeType,
  { icon: React.ReactNode; wrapper: string; line: string; dot: string }
> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    wrapper: "bg-primary-500 text-white",
    line: "bg-primary-200",
    dot: "ring-primary-200",
  },
  pending: {
    icon: <Clock className="w-4 h-4" />,
    wrapper: "bg-warning-500 text-white",
    line: "bg-warning-200",
    dot: "ring-warning-200",
  },
  warning: {
    icon: <AlertCircle className="w-4 h-4" />,
    wrapper: "bg-secondary-500 text-white",
    line: "bg-secondary-200",
    dot: "ring-secondary-200",
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    wrapper: "bg-slate-500 text-white",
    line: "bg-slate-200",
    dot: "ring-slate-200",
  },
  error: {
    icon: <XCircle className="w-4 h-4" />,
    wrapper: "bg-danger-500 text-white",
    line: "bg-danger-200",
    dot: "ring-danger-200",
  },
  default: {
    icon: <FileText className="w-4 h-4" />,
    wrapper: "bg-slate-400 text-white",
    line: "bg-slate-200",
    dot: "ring-slate-200",
  },
};

export const VerticalTimeline: React.FC<VerticalTimelineProps> = ({
  items,
  className,
  animate = true,
}) => {
  return (
    <div className={cn("relative pl-2", className)}>
      <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-slate-100" />
      <ol className="space-y-6">
        {items.map((item, index) => {
          const type = item.type ?? "default";
          const config = nodeConfig[type];
          const isLast = index === items.length - 1;
          return (
            <li
              key={item.id}
              className={cn(
                "relative",
                animate && "animate-fade-in-up",
                animate && { "animation-delay": `${index * 80}ms` }
              )}
              style={
                animate
                  ? ({ animationDelay: `${index * 80}ms` } as React.CSSProperties)
                  : undefined
              }
            >
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[22px] top-10 w-0.5 -ml-px h-[calc(100%-16px)]",
                    config.line
                  )}
                />
              )}
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "relative z-10 shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ring-4",
                    config.wrapper,
                    config.dot,
                    item.active && "animate-pulse-soft"
                  )}
                >
                  {item.icon ?? config.icon}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </h4>
                    {item.time && (
                      <span className="shrink-0 text-xs text-slate-400 font-medium whitespace-nowrap">
                        {item.time}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.extra && (
                    <div className="mt-3">{item.extra}</div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

VerticalTimeline.displayName = "VerticalTimeline";
