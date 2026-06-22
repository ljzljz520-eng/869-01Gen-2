import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
  variant?: "default" | "pills";
  className?: string;
  tabClassName?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onChange,
  children,
  variant = "default",
  className,
  tabClassName,
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative inline-flex items-center gap-1 p-1.5 glass card-rounded",
          variant === "default" && "w-full"
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.value)}
              className={cn(
                "relative flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                tabClassName,
                variant === "default" &&
                  isActive &&
                  "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft",
                variant === "default" &&
                  !isActive &&
                  !tab.disabled &&
                  "text-slate-600 hover:text-slate-800 hover:bg-white/60",
                variant === "pills" &&
                  isActive &&
                  "bg-primary-100 text-primary-700 border border-primary-200",
                variant === "pills" &&
                  !isActive &&
                  !tab.disabled &&
                  "text-slate-600 hover:bg-slate-100",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {children && (
        <div className="mt-6 animate-fade-in-up">
          {children}
        </div>
      )}
    </div>
  );
};

Tabs.displayName = "Tabs";

export const TabContent: React.FC<{
  value: string;
  activeValue: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, activeValue, children, className }) => {
  if (value !== activeValue) return null;
  return <div className={cn("animate-fade-in", className)}>{children}</div>;
};

TabContent.displayName = "TabContent";
