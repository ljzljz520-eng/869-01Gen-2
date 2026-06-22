import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '@/store/authStore';
import { useAuthStore } from '@/store/authStore';

import HomePage from '@/pages/public/HomePage';
import ProjectDetailPage from '@/pages/public/ProjectDetailPage';
import LoginPage from '@/pages/admin/LoginPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import ProjectManagePage from '@/pages/admin/ProjectManagePage';
import ExpenseManagePage from '@/pages/admin/ExpenseManagePage';
import DisputeHandlePage from '@/pages/admin/DisputeHandlePage';
import AuditDashboard from '@/pages/audit/AuditDashboard';
import VoucherAudit from '@/pages/audit/VoucherAudit';
import DisputeAudit from '@/pages/audit/DisputeAudit';
import NotFound from '@/pages/NotFound';

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  allowedRoles?: UserRole[];
  title?: string;
  description?: string;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['org_admin', 'auditor'],
}) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.currentUser);
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'public') {
      return <Navigate to="/" replace />;
    }
    const targetRoute = currentUser.role === 'auditor' ? '/audit/dashboard' : '/admin/dashboard';
    return <Navigate to={targetRoute} replace />;
  }

  return <>{children}</>;
};

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  public: '/',
  org_admin: '/admin/dashboard',
  auditor: '/audit/dashboard',
};

export const PUBLIC_ROUTES: RouteConfig[] = [
  {
    path: '/',
    element: <HomePage />,
    title: '公益募捐透明度看板',
    description: '公开透明的公益项目展示与监督平台',
  },
  {
    path: '/project/:id',
    element: <ProjectDetailPage />,
    title: '项目详情',
    description: '项目募资明细、支出记录与进展更新',
  },
];

export const AUTH_ROUTES: RouteConfig[] = [
  {
    path: '/login',
    element: <LoginPage />,
    title: '登录',
    description: '机构管理员或平台审核员登录',
  },
];

export const ADMIN_ROUTES: RouteConfig[] = [
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['org_admin']}>
        <DashboardPage />
      </ProtectedRoute>
    ),
    allowedRoles: ['org_admin'],
    title: '机构管理后台',
    description: '公益机构的管理工作台',
  },
  {
    path: '/admin/projects',
    element: (
      <ProtectedRoute allowedRoles={['org_admin']}>
        <ProjectManagePage />
      </ProtectedRoute>
    ),
    allowedRoles: ['org_admin'],
    title: '项目管理',
    description: '公益项目的创建与维护',
  },
  {
    path: '/admin/expenses',
    element: (
      <ProtectedRoute allowedRoles={['org_admin']}>
        <ExpenseManagePage />
      </ProtectedRoute>
    ),
    allowedRoles: ['org_admin'],
    title: '支出凭证管理',
    description: '支出录入、凭证上传与审核状态跟踪',
  },
  {
    path: '/admin/disputes',
    element: (
      <ProtectedRoute allowedRoles={['org_admin']}>
        <DisputeHandlePage />
      </ProtectedRoute>
    ),
    allowedRoles: ['org_admin'],
    title: '质疑处理中心',
    description: '公众质疑的回复与问题修正',
  },
];

export const AUDIT_ROUTES: RouteConfig[] = [
  {
    path: '/audit/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['auditor']}>
        <AuditDashboard />
      </ProtectedRoute>
    ),
    allowedRoles: ['auditor'],
    title: '审核中心首页',
    description: '平台审核员的工作概览',
  },
  {
    path: '/audit/vouchers',
    element: (
      <ProtectedRoute allowedRoles={['auditor']}>
        <VoucherAudit />
      </ProtectedRoute>
    ),
    allowedRoles: ['auditor'],
    title: '凭证审核',
    description: '支出凭证的真伪验证与审核',
  },
  {
    path: '/audit/disputes',
    element: (
      <ProtectedRoute allowedRoles={['auditor']}>
        <DisputeAudit />
      </ProtectedRoute>
    ),
    allowedRoles: ['auditor'],
    title: '质疑审核',
    description: '机构回复与修正内容的审核',
  },
];

const DashboardRedirect: React.FC = () => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const target = currentUser?.role === 'auditor' ? '/audit/dashboard' : '/admin/dashboard';
  return <Navigate to={target} replace />;
};

const LogoutHandler: React.FC = () => {
  const logout = useAuthStore((s) => s.logout);
  React.useEffect(() => {
    logout();
  }, [logout]);
  return <Navigate to="/login" replace />;
};

export const REDIRECT_ROUTES: RouteConfig[] = [
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/audit',
    element: <Navigate to="/audit/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: <DashboardRedirect />,
  },
  {
    path: '/logout',
    element: <LogoutHandler />,
  },
];

export const FALLBACK_ROUTES: RouteConfig[] = [
  {
    path: '*',
    element: <NotFound />,
    title: '页面不存在',
    description: '404 错误页面',
  },
];

export const ALL_ROUTES: RouteConfig[] = [
  ...PUBLIC_ROUTES,
  ...AUTH_ROUTES,
  ...REDIRECT_ROUTES,
  ...ADMIN_ROUTES,
  ...AUDIT_ROUTES,
  ...FALLBACK_ROUTES,
];

export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return ALL_ROUTES.find((r) => r.path === path);
};

export const getRoutesByRole = (role: UserRole): RouteConfig[] => {
  if (role === 'public') {
    return [...PUBLIC_ROUTES, ...AUTH_ROUTES, ...FALLBACK_ROUTES];
  }
  if (role === 'org_admin') {
    return [...PUBLIC_ROUTES, ...AUTH_ROUTES, ...REDIRECT_ROUTES, ...ADMIN_ROUTES, ...FALLBACK_ROUTES];
  }
  return [...PUBLIC_ROUTES, ...AUTH_ROUTES, ...REDIRECT_ROUTES, ...AUDIT_ROUTES, ...FALLBACK_ROUTES];
};

export const getRoleDashboardRoute = (role: UserRole): string => {
  return ROLE_DEFAULT_ROUTES[role];
};

export const canAccessRoute = (path: string, role: UserRole): boolean => {
  const route = ALL_ROUTES.find((r) => r.path === path);
  if (!route) return true;
  if (!route.allowedRoles || route.allowedRoles.length === 0) return true;
  return route.allowedRoles.includes(role);
};

export default ALL_ROUTES;
