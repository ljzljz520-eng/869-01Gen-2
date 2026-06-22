/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import {
  LayoutDashboard,
  FolderPlus,
  ClipboardList,
  Receipt,
  AlertOctagon,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Heart,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  value: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeClass?: string;
  disabled?: boolean;
}

export const adminNavItems: SidebarNavItem[] = [
  {
    value: "dashboard",
    label: "数据看板",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    value: "projects",
    label: "项目管理",
    icon: <FolderPlus className="w-5 h-5" />,
  },
  {
    value: "applications",
    label: "筹款申请",
    icon: <ClipboardList className="w-5 h-5" />,
    badge: 3,
    badgeClass: "bg-warning-500 text-white",
  },
  {
    value: "finance",
    label: "资金明细",
    icon: <Receipt className="w-5 h-5" />,
  },
  {
    value: "disputes",
    label: "质疑处理",
    icon: <AlertOctagon className="w-5 h-5" />,
    badge: "新",
    badgeClass: "bg-danger-500 text-white",
  },
  {
    value: "donors",
    label: "捐赠人信息",
    icon: <Users className="w-5 h-5" />,
  },
  {
    value: "reports",
    label: "公示报告",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    value: "settings",
    label: "机构设置",
    icon: <Settings className="w-5 h-5" />,
  },
];

export interface AdminSidebarProps {
  value: string;
  onChange: (value: string) => void;
  items?: SidebarNavItem[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  orgName?: string;
  orgAvatar?: string;
  className?: string;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  value,
  onChange,
  items = adminNavItems,
  collapsed = false,
  onCollapsedChange,
  orgName = "某公益基金会",
  orgAvatar,
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
        <div className="shrink-0 w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-soft">
          <Heart className="w-5 h-5 text-white fill-white/30" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-gradient-primary truncate">
              机构后台
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5">
              Organization
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
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft"
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
            "flex items-center rounded-xl bg-slate-50/80",
            collapsed ? "p-2 justify-center" : "p-3 gap-3"
          )}
        >
          <div className="shrink-0 w-9 h-9 rounded-2xl bg-gradient-to-br from-secondary-400 to-secondary-500 flex items-center justify-center text-white text-sm font-bold shadow-soft overflow-hidden">
            {orgAvatar ? (
              <img src={orgAvatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              orgName.slice(0, 1)
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-800 truncate">
                {orgName}
              </div>
              <div className="text-[11px] text-slate-400">管理员</div>
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

AdminSidebar.displayName = "AdminSidebar";
