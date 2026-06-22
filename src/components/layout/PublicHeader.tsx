import * as React from "react";
import {
  Heart,
  Search,
  Menu,
  X,
  ChevronDown,
  LogIn,
  Building2,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "public" | "organization" | "auditor";

export interface PublicHeaderProps {
  className?: string;
  currentRole?: Role;
  onRoleChange?: (role: Role) => void;
  onLogin?: () => void;
  logoText?: string;
}

const roleOptions: { value: Role; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: "public",
    label: "公开访问",
    icon: <UserIcon className="w-4 h-4" />,
    desc: "浏览公益项目",
  },
  {
    value: "organization",
    label: "机构后台",
    icon: <Building2 className="w-4 h-4" />,
    desc: "公益机构管理",
  },
  {
    value: "auditor",
    label: "审核中心",
    icon: <ShieldCheck className="w-4 h-4" />,
    desc: "监督审计平台",
  },
];

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  className,
  currentRole = "public",
  onRoleChange,
  onLogin,
  logoText = "透明善款",
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentRoleInfo = roleOptions.find((r) => r.value === currentRole) ?? roleOptions[0];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled ? "glass shadow-soft-lg border-b border-white/50" : "bg-transparent",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-soft group-hover:shadow-glass-hover transition-all duration-300">
              <Heart className="w-5 h-5 text-white fill-white/30" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-gradient-primary">
                {logoText}
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden sm:block">
                公益募捐透明度看板
              </span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {["项目列表", "数据统计", "机构入驻", "关于我们"].map((item) => (
              <a
                key={item}
                href="#"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-xl transition-all"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-3">
            <button className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white/60 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setRoleMenuOpen((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                  roleMenuOpen
                    ? "bg-primary-50 text-primary-700 ring-1 ring-primary-200"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                )}
              >
                {currentRoleInfo.icon}
                <span className="hidden sm:inline">{currentRoleInfo.label}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    roleMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 glass card-rounded-lg p-2 shadow-glass-hover animate-fade-in-down">
                  {roleOptions.map((opt) => {
                    const isActive = currentRole === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          onRoleChange?.(opt.value);
                          setRoleMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all",
                          isActive
                            ? "bg-primary-50 ring-1 ring-primary-200"
                            : "hover:bg-slate-50"
                        )}
                      >
                        <div
                          className={cn(
                            "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
                            isActive
                              ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {opt.icon}
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div
                            className={cn(
                              "text-sm font-semibold",
                              isActive ? "text-primary-700" : "text-slate-700"
                            )}
                          >
                            {opt.label}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {opt.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={onLogin}
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-soft hover:shadow-soft-lg hover:from-primary-600 hover:to-primary-700 transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>登录</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white/60 transition-colors"
              aria-label="菜单"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden glass border-t border-white/50 animate-fade-in-down">
          <div className="px-4 py-4 space-y-1">
            {["项目列表", "数据统计", "机构入驻", "关于我们"].map((item) => (
              <a
                key={item}
                href="#"
                className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60 rounded-xl transition-all"
              >
                {item}
              </a>
            ))}
            <button
              onClick={onLogin}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-soft"
            >
              <LogIn className="w-4 h-4" />
              <span>登录</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

PublicHeader.displayName = "PublicHeader";
