import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Scale,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
  ListTodo,
  Zap,
  CalendarDays,
  Gauge,
  Target,
  Users,
  FileWarning,
  ChevronRight,
} from 'lucide-react';
import {
  AuditSidebar,
  type AuditNavItem,
} from '@/components/layout/AuditSidebar';
import { StatCard } from '@/components/charts/StatCard';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { formatAmountShort, formatDate, formatPercent } from '@/utils/formatter';

interface AuditDashboardProps {
  className?: string;
}

const AuditDashboard: React.FC<AuditDashboardProps> = ({ className }) => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const expenses = useDataStore((s) => s.expenses);
  const disputes = useDataStore((s) => s.disputes);
  const projects = useDataStore((s) => s.projects);

  const [activeNav, setActiveNav] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(false);

  const pendingExpenses = expenses.filter((e) => e.status === 'pending');
  const approvedExpenses = expenses.filter((e) => e.status === 'approved');
  const rejectedExpenses = expenses.filter((e) => e.status === 'rejected');
  const disputedExpenses = expenses.filter((e) => e.status === 'disputed');

  const openDisputes = disputes.filter(
    (d) => d.status === 'open' || d.status === 'in_progress'
  );
  const resolvedDisputes = disputes.filter((d) => d.status === 'resolved');

  const totalPendingValue = pendingExpenses.reduce((s, e) => s + e.amount, 0);
  const totalProcessed = approvedExpenses.length + rejectedExpenses.length;
  const totalAuditTarget = expenses.length;
  const auditProgress = totalAuditTarget > 0 ? (totalProcessed / totalAuditTarget) * 100 : 0;

  const today = new Date().toISOString().slice(0, 10);
  const todaysWork = [
    ...pendingExpenses.slice(0, 3).map((e) => ({
      id: e.id,
      type: 'voucher' as const,
      title: e.title,
      amount: e.amount,
      submitter: e.recipientName,
      time: e.submittedAt,
    })),
    ...openDisputes.slice(0, 2).map((d) => ({
      id: d.id,
      type: 'dispute' as const,
      title: d.title,
      amount: 0,
      submitter: d.submitterName,
      time: d.createdAt,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const weeklyEfficiency = [
    { day: '周一', count: 5, rate: 92 },
    { day: '周二', count: 7, rate: 88 },
    { day: '周三', count: 4, rate: 95 },
    { day: '周四', count: 8, rate: 90 },
    { day: '周五', count: 6, rate: 85 },
    { day: '周六', count: 2, rate: 100 },
    { day: '周日', count: 1, rate: 100 },
  ];
  const maxWeeklyCount = Math.max(...weeklyEfficiency.map((w) => w.count));
  const avgAuditTime = 4.2;

  const customNavItems: AuditNavItem[] = React.useMemo(
    () => [
      {
        value: 'dashboard',
        label: '审核概览',
        icon: <Gauge className="w-5 h-5" />,
      },
      {
        value: 'vouchers',
        label: '凭证审核',
        icon: <FileCheck2 className="w-5 h-5" />,
        badge: pendingExpenses.length > 0 ? pendingExpenses.length : undefined,
        badgeClass: 'bg-warning-500 text-white',
      },
      {
        value: 'disputes',
        label: '质疑仲裁',
        icon: <Scale className="w-5 h-5" />,
        badge: openDisputes.length > 0 ? openDisputes.length : undefined,
        badgeClass: 'bg-danger-500 text-white',
      },
      {
        value: 'monitor',
        label: '资金监控',
        icon: <Activity className="w-5 h-5" />,
      },
      {
        value: 'risk',
        label: '风险预警',
        icon: <AlertTriangle className="w-5 h-5" />,
        badge: disputedExpenses.length > 0 ? disputedExpenses.length : undefined,
        badgeClass: 'bg-secondary-500 text-white',
      },
      {
        value: 'reports',
        label: '数据统计',
        icon: <TrendingUp className="w-5 h-5" />,
      },
    ],
    [pendingExpenses.length, openDisputes.length, disputedExpenses.length]
  );

  const handleNavChange = (value: string) => {
    setActiveNav(value);
    const routeMap: Record<string, string> = {
      dashboard: '/audit/dashboard',
      vouchers: '/audit/vouchers',
      disputes: '/audit/disputes',
    };
    if (routeMap[value]) {
      navigate(routeMap[value]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const quickActions = [
    {
      label: '开始凭证审核',
      desc: `${pendingExpenses.length} 笔待审核凭证`,
      icon: <FileCheck2 className="w-5 h-5" />,
      bgClass: 'from-warning-50 to-warning-100/50',
      iconBgClass: 'bg-warning-500',
      onClick: () => navigate('/audit/vouchers'),
    },
    {
      label: '处理质疑仲裁',
      desc: `${openDisputes.length} 条待仲裁质疑`,
      icon: <Scale className="w-5 h-5" />,
      bgClass: 'from-danger-50 to-danger-100/50',
      iconBgClass: 'bg-danger-500',
      onClick: () => navigate('/audit/disputes'),
    },
    {
      label: '查看风险预警',
      desc: `${disputedExpenses.length} 条异常记录`,
      icon: <AlertTriangle className="w-5 h-5" />,
      bgClass: 'from-secondary-50 to-secondary-100/50',
      iconBgClass: 'bg-secondary-500',
      onClick: () => navigate('/audit/vouchers'),
    },
    {
      label: '导出审核报告',
      desc: '生成月度审核报告',
      icon: <FileWarning className="w-5 h-5" />,
      bgClass: 'from-primary-50 to-primary-100/50',
      iconBgClass: 'bg-primary-500',
      onClick: () => {},
    },
  ];

  return (
    <div className={`flex min-h-screen bg-slate-50/50 ${className ?? ''}`}>
      <AuditSidebar
        value={activeNav}
        onChange={handleNavChange}
        items={customNavItems}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        auditorName={currentUser?.name ?? '李华'}
        auditorLevel="高级审核员"
        auditorAvatar={currentUser?.avatar}
        onLogout={handleLogout}
      />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-100/80 bg-white/60 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">审核概览</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser?.orgName} · {currentUser?.name}，今日审核工作顺利
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="approved" showIcon>
              {formatDate(today + 'T00:00:00.000Z', 'date')}
            </Badge>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="待审核凭证"
              value={pendingExpenses.length}
              suffix="笔"
              icon={<FileCheck2 className="w-5 h-5" />}
              iconBgClass="bg-gradient-to-br from-warning-500 to-warning-600"
              description={`待审核金额 ${formatAmountShort(totalPendingValue)}`}
              trend={{
                direction: pendingExpenses.length > 0 ? 'up' : 'neutral',
                value: pendingExpenses.length > 0 ? '+2 笔' : '0',
                label: '今日新增',
              }}
              onClick={() => navigate('/audit/vouchers')}
            />
            <StatCard
              title="待处理质疑"
              value={openDisputes.length}
              suffix="条"
              icon={<Scale className="w-5 h-5" />}
              iconBgClass="bg-gradient-to-br from-danger-500 to-danger-600"
              description={`${resolvedDisputes.length} 条已完成仲裁`}
              trend={{
                direction: 'neutral',
                value: openDisputes.length > 0 ? `${openDisputes.length} 条` : '0',
                label: '需要您关注',
              }}
              onClick={() => navigate('/audit/disputes')}
            />
            <StatCard
              title="审核通过率"
              value={totalProcessed > 0 ? Math.round((approvedExpenses.length / totalProcessed) * 100) : 0}
              suffix="%"
              icon={<CheckCircle2 className="w-5 h-5" />}
              iconBgClass="bg-gradient-to-br from-primary-500 to-primary-600"
              description={`通过 ${approvedExpenses.length} 笔 / 驳回 ${rejectedExpenses.length} 笔`}
              trend={{
                direction: 'up',
                value: '+3.2%',
                label: '较上周',
              }}
            />
            <StatCard
              title="平均审核时长"
              value={avgAuditTime}
              suffix="小时"
              icon={<Clock className="w-5 h-5" />}
              iconBgClass="bg-gradient-to-br from-secondary-500 to-secondary-600"
              description="从提交到审核完成的平均时长"
              trend={{
                direction: 'down',
                value: '-0.8h',
                label: '效率提升',
              }}
            />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <Card className="xl:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-warning-500" />
                      快捷操作
                    </CardTitle>
                    <CardDescription>快速处理您的待办审核事项</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {quickActions.map((action, idx) => (
                    <div
                      key={idx}
                      onClick={action.onClick}
                      className={`group relative p-4 rounded-xl bg-gradient-to-br ${action.bgClass} border border-white/60 hover:shadow-soft transition-all duration-200 cursor-pointer hover:-translate-y-0.5`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-soft ${action.iconBgClass}`}
                        >
                          {action.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-800">
                              {action.label}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                          <p className="mt-1 text-xs text-slate-600/80">
                            {action.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary-500" />
                      审核完成进度
                    </CardTitle>
                    <CardDescription>全部凭证审核完成情况</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <ProgressRing
                    progress={auditProgress}
                    size={160}
                    strokeWidth={14}
                    color="primary"
                    subtitle={`${totalProcessed} / ${totalAuditTarget} 笔`}
                  />
                  <div className="mt-5 w-full space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                        <span className="text-slate-600 font-medium">已通过</span>
                      </div>
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {approvedExpenses.length} 笔
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-danger-500" />
                        <span className="text-slate-600 font-medium">已驳回</span>
                      </div>
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {rejectedExpenses.length} 笔
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-warning-500" />
                        <span className="text-slate-600 font-medium">待审核</span>
                      </div>
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {pendingExpenses.length} 笔
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-secondary-500" />
                        <span className="text-slate-600 font-medium">有争议</span>
                      </div>
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {disputedExpenses.length} 笔
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <Card className="xl:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-secondary-500" />
                      本周审核效率
                    </CardTitle>
                    <CardDescription>近7天审核数量与通过率趋势</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800 tabular-nums">
                      {weeklyEfficiency.reduce((s, w) => s + w.count, 0)}
                    </div>
                    <div className="text-xs text-slate-500">本周总审核笔数</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="flex items-end justify-between gap-3 h-40 pt-4">
                    {weeklyEfficiency.map((item, idx) => {
                      const heightPercent = maxWeeklyCount > 0 ? (item.count / maxWeeklyCount) * 100 : 0;
                      const todayIdx = new Date().getDay();
                      const adjustedIdx = todayIdx === 0 ? 6 : todayIdx - 1;
                      const isToday = idx === adjustedIdx;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full relative group">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              <div className="px-2 py-1 rounded-lg bg-slate-800 text-white text-[10px] font-medium shadow-lg">
                                {item.count}笔 · 通过率{item.rate}%
                              </div>
                            </div>
                            <div
                              className={`w-full rounded-t-lg transition-all duration-300 ${
                                isToday
                                  ? 'bg-gradient-to-t from-secondary-500 to-secondary-400 shadow-soft'
                                  : 'bg-gradient-to-t from-primary-400/80 to-primary-300/60 hover:from-primary-500 hover:to-primary-400'
                              }`}
                              style={{ height: `${Math.max(heightPercent, 8)}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              isToday ? 'text-secondary-600' : 'text-slate-500'
                            }`}
                          >
                            {item.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-gradient-to-t from-primary-400/80 to-primary-300/60" />
                      <span className="text-xs text-slate-600">日常审核</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-gradient-to-t from-secondary-500 to-secondary-400" />
                      <span className="text-xs text-slate-600">今天</span>
                    </div>
                    <div className="ml-auto text-xs text-slate-500">
                      周均通过率{' '}
                      <span className="font-semibold text-slate-700">
                        {Math.round(
                          weeklyEfficiency.reduce((s, w) => s + w.rate, 0) / weeklyEfficiency.length
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ListTodo className="w-4 h-4 text-warning-500" />
                      今日工作
                    </CardTitle>
                    <CardDescription>
                      待处理共 {todaysWork.length} 项
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    全部
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {todaysWork.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 mb-3">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-semibold text-slate-700">
                        今日工作已完成
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        稍后再来查看是否有新的审核任务
                      </div>
                    </div>
                  ) : (
                    todaysWork.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          navigate(item.type === 'voucher' ? '/audit/vouchers' : '/audit/disputes')
                        }
                        className="group p-3 rounded-xl border border-slate-100 bg-white/50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                              item.type === 'voucher'
                                ? 'bg-warning-100 text-warning-600'
                                : 'bg-danger-100 text-danger-600'
                            }`}
                          >
                            {item.type === 'voucher' ? (
                              <FileCheck2 className="w-4 h-4" />
                            ) : (
                              <Scale className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.type === 'voucher'
                                    ? 'bg-warning-100 text-warning-700'
                                    : 'bg-danger-100 text-danger-700'
                                }`}
                              >
                                {item.type === 'voucher' ? '凭证' : '质疑'}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {formatDate(item.time, 'relative')}
                              </span>
                            </div>
                            <div className="mt-1 text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-slate-900">
                              {item.title}
                            </div>
                            <div className="mt-0.5 flex items-center justify-between gap-2">
                              <span className="text-[11px] text-slate-500 truncate">
                                <Users className="w-3 h-3 inline mr-1 -mt-0.5" />
                                {item.submitter}
                              </span>
                              {item.amount > 0 && (
                                <span className="text-[11px] font-bold text-slate-700 shrink-0 tabular-nums">
                                  {formatAmountShort(item.amount)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary-500" />
                      最近审核记录
                    </CardTitle>
                    <CardDescription>近期处理的凭证审核情况</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...approvedExpenses, ...rejectedExpenses]
                    .sort(
                      (a, b) =>
                        new Date(b.approvedAt ?? b.updatedAt).getTime() -
                        new Date(a.approvedAt ?? a.updatedAt).getTime()
                    )
                    .slice(0, 5)
                    .map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50/50 transition-colors"
                      >
                        <div
                          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                            expense.status === 'approved'
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-danger-100 text-danger-600'
                          }`}
                        >
                          {expense.status === 'approved' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {expense.title}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            {expense.approver ?? '系统审核'} ·{' '}
                            {formatDate(expense.approvedAt ?? expense.updatedAt, 'relative')}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-slate-800 tabular-nums">
                            {formatAmountShort(expense.amount)}
                          </div>
                          <Badge
                            variant={expense.status === 'approved' ? 'approved' : 'rejected'}
                            showIcon={false}
                            className="mt-0.5 scale-90 origin-right"
                          >
                            {expense.status === 'approved' ? '通过' : '驳回'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-secondary-500" />
                      项目审核概览
                    </CardTitle>
                    <CardDescription>各公益项目支出审核情况</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => {
                    const projExpenses = expenses.filter((e) => e.projectId === project.id);
                    const projApproved = projExpenses.filter((e) => e.status === 'approved');
                    const projPending = projExpenses.filter((e) => e.status === 'pending');
                    const projTotal = projExpenses.reduce((s, e) => s + e.amount, 0);
                    const projApprovedValue = projApproved.reduce((s, e) => s + e.amount, 0);
                    const progress = projTotal > 0 ? (projApprovedValue / projTotal) * 100 : 0;
                    return (
                      <div key={project.id} className="p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-slate-100">
                            <img
                              src={project.coverImage}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-800 truncate">
                              {project.title}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px]">
                              <span className="text-slate-500">
                                支出 {projExpenses.length} 笔
                              </span>
                              <span className="text-primary-600 font-medium">
                                通过 {projApproved.length}
                              </span>
                              {projPending.length > 0 && (
                                <span className="text-warning-600 font-medium">
                                  待审 {projPending.length}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-slate-800 tabular-nums">
                              {formatAmountShort(projApprovedValue)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatPercent(progress, 100)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AuditDashboard;
