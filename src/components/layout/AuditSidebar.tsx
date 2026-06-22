/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Eye,
  AlertTriangle,
  Scale,
  FileCheck2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuditNavItem {
  value: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeClass?: string;
  disabled?: boolean;
}

export const auditNavItems: AuditNavItem[] = [
  {
    value: "dashboard",
    label: "审核概览",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    value: "review",
    label: "项目审核",
    icon: <ShieldCheck className="w-5 h-5" />,
    badge: 12,
    badgeClass: "bg-warning-500 text-white",
  },
  {
    value: "monitor",
    label: "资金监控",
    icon: <Eye className="w-5 h-5" />,
  },
  {
    value: "risk",
    label: "风险预警",
    icon: <AlertTriangle className="w-5 h-5" />,
    badge: 5,
    badgeClass: "bg-danger-500 text-white",
  },
  {
    value: "disputes",
    label: "质疑仲裁",
    icon: <Scale className="w-5 h-5" />,
    badge: "新",
    badgeClass: "bg-secondary-500 text-white",
  },
  {
    value: "reports",
    label: "公示审核",
    icon: <FileCheck2 className="w-5 h-5" />,
  },
  {
    value: "analytics",
    label: "数据统计",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    value: "settings",
    label: "审核配置",
    icon: <Settings className="w-5 h-5" />,
  },
];

export interface AuditSidebarProps {
  value: string;
  onChange: (value: string) => void;
  items?: AuditNavItem[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  auditorName?: string;
  auditorLevel?: string;
  auditorAvatar?: string;
  className?: string;
  onLogout?: () => void;
}

export const AuditSidebar: React.FC<AuditSidebarProps> = ({
  value,
  onChange,
  items = auditNavItems,
  collapsed = false,
  onCollapsedChange,
  auditorName = "张审核员",
  auditorLevel = "高级审核员",
  auditorAvatar,
  className,
  onLogout,
}) => {
  return (
    <aside
      className={cn(
        "relative h-screen flex flex-col glass border-r border-white/50 transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center h-16 border-b border-slate-100/80",
          collapsed ? "px-3 justify-center" : "px-5 gap-3"
        )}
      >
        <div className="shrink-0 w-9 h-9 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-soft">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold bg-gradient-to-r from-secondary-600 to-secondary-500 bg-clip-text text-transparent truncate">
              审核中心
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5">
              Audit Center
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = value === item.value;
            return (
              <li key={item.value}>
                <button
                  onClick={() => !item.disabled && onChange(item.value)}
                  disabled={item.disabled}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "w-full relative flex items-center gap-3 rounded-xl transition-all duration-200 group",
                    collapsed ? "h-11 justify-center px-0" : "h-11 px-3",
                    isActive
                      ? "bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-soft"
                      : item.disabled
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium truncate">
                        {item.label}
                      </span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold",
                            item.badgeClass ??
                              (isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-600")
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge !== undefined && !isActive && (
                    <span
                      className={cn(
                        "absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white",
                        item.badgeClass ?? "bg-danger-500"
                      )}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-100/80 p-3 space-y-2">
        <div
          className={cn(
            "flex items-center rounded-xl bg-gradient-to-br from-secondary-50/80 to-primary-50/80 border border-secondary-100/50",
            collapsed ? "p-2 justify-center" : "p-3 gap-3"
          )}
        >
          <div className="shrink-0 w-9 h-9 rounded-2xl bg-gradient-to-br from-secondary-400 to-primary-400 flex items-center justify-center text-white text-sm font-bold shadow-soft overflow-hidden">
            {auditorAvatar ? (
              <img src={auditorAvatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              auditorName.slice(0, 1)
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-800 truncate">
                {auditorName}
              </div>
              <div className="text-[11px] text-secondary-600 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {auditorLevel}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCollapsedChange?.(!collapsed)}
            className={cn(
              "shrink-0 flex items-center justify-center h-10 rounded-xl text-slate-500 hover:bg-white/60 hover:text-slate-700 transition-colors",
              collapsed ? "w-full" : "w-10"
            )}
            title={collapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
          {!collapsed && (
            <button
              onClick={onLogout}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-slate-500 hover:bg-danger-50 hover:text-danger-600 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

AuditSidebar.displayName = "AuditSidebar";
