import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type StatTrend = "up" | "down" | "neutral";

export interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  trend?: {
    direction: StatTrend;
    value: string;
    label?: string;
  };
  icon?: React.ReactNode;
  iconBgClass?: string;
  description?: string;
  animate?: boolean;
  className?: string;
  onClick?: () => void;
}

const useCountUp = (target: number, duration = 1500, start = true) => {
  const [value, setValue] = React.useState(start ? 0 : target);

  React.useEffect(() => {
    if (!start || typeof target !== "number") {
      setValue(target);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(easeOutCubic(progress) * target));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration, start]);

  return value;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  trend,
  icon,
  iconBgClass = "bg-gradient-to-br from-primary-500 to-primary-600",
  description,
  animate = true,
  className,
  onClick,
}) => {
  const numericValue = typeof value === "number" ? value : parseFloat(value);
  const isNumeric = !isNaN(numericValue);
  const displayValue = useCountUp(isNumeric ? numericValue : 0, 1500, animate && isNumeric);

  const trendConfig = trend
    ? {
        up: {
          icon: <TrendingUp className="w-4 h-4" />,
          wrapper: "bg-primary-50 text-primary-700",
        },
        down: {
          icon: <TrendingDown className="w-4 h-4" />,
          wrapper: "bg-danger-50 text-danger-700",
        },
        neutral: {
          icon: <Minus className="w-4 h-4" />,
          wrapper: "bg-slate-100 text-slate-600",
        },
      }[trend.direction]
    : null;

  const renderValue = () => {
    if (isNumeric) {
      const formatted = animate ? displayValue.toLocaleString() : numericValue.toLocaleString();
      return (
        <>
          {prefix && <span className="text-lg font-semibold mr-0.5">{prefix}</span>}
          <span>{formatted}</span>
          {suffix && <span className="text-base font-medium ml-0.5 opacity-80">{suffix}</span>}
        </>
      );
    }
    return (
      <>
        {prefix && <span className="text-lg font-semibold mr-0.5">{prefix}</span>}
        <span>{value}</span>
        {suffix && <span className="text-base font-medium ml-0.5 opacity-80">{suffix}</span>}
      </>
    );
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass card-rounded-lg p-6 transition-all duration-300 hover:shadow-glass-hover",
        onClick && "cursor-pointer hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
          <div className="mt-3 flex items-baseline text-3xl font-bold text-slate-800 tracking-tight animate-fade-in-up">
            {renderValue()}
          </div>
          {description && (
            <p className="mt-2 text-xs text-slate-400 line-clamp-1">{description}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-soft",
              iconBgClass
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {trend && trendConfig && (
        <div className="mt-5 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold",
              trendConfig.wrapper
            )}
          >
            {trendConfig.icon}
            {trend.value}
          </span>
          {trend.label && (
            <span className="text-xs text-slate-400">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
};

StatCard.displayName = "StatCard";
