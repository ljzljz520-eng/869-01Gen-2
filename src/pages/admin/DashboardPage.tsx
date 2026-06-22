import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Users,
  Receipt,
  AlertOctagon,
  Clock,
  FileCheck2,
  MessageSquareWarning,
  Sparkles,
  ArrowRight,
  FolderPlus,
  ClipboardList,
  Activity,
} from 'lucide-react';
import {
  AdminSidebar,
  type SidebarNavItem,
} from '@/components/layout/AdminSidebar';
import { StatCard } from '@/components/charts/StatCard';
import {
  VerticalTimeline,
  type VerticalTimelineItem,
} from '@/components/timeline/VerticalTimeline';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { projects } from '@/data/projects';
import { expenses } from '@/data/expenses';
import { disputes } from '@/data/disputes';
import { formatAmountShort, formatDate } from '@/utils/formatter';

interface DashboardPageProps {
  className?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ className }) => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const [activeNav, setActiveNav] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(false);

  const mainProject = projects[0];

  const pendingExpenses = expenses.filter((e) => e.status === 'pending').length;
  const approvedExpenses = expenses.filter(
    (e) => e.status === 'approved'
  ).length;
  const disputedItems = expenses.filter((e) => e.status === 'disputed').length;
  const openDisputes = disputes.filter(
    (d) => d.status === 'open' || d.status === 'in_progress'
  ).length;

  const totalRaised = projects.reduce((sum, p) => sum + p.raisedAmount, 0);
  const totalDonors = projects.reduce((sum, p) => sum + p.donorCount, 0);
  const totalExpensed = expenses
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const customNavItems: SidebarNavItem[] = React.useMemo(
    () => [
      {
        value: 'dashboard',
        label: '数据看板',
        icon: <Activity className="w-5 h-5" />,
      },
      {
        value: 'projects',
        label: '项目管理',
        icon: <FolderPlus className="w-5 h-5" />,
      },
      {
        value: 'applications',
        label: '筹款申请',
        icon: <ClipboardList className="w-5 h-5" />,
        badge: 3,
        badgeClass: 'bg-warning-500 text-white',
      },
      {
        value: 'expenses',
        label: '支出管理',
        icon: <Receipt className="w-5 h-5" />,
      },
      {
        value: 'disputes',
        label: '质疑处理',
        icon: <AlertOctagon className="w-5 h-5" />,
        badge: openDisputes > 0 ? openDisputes : undefined,
        badgeClass: 'bg-danger-500 text-white',
      },
    ],
    [openDisputes]
  );

  const handleNavChange = (value: string) => {
    setActiveNav(value);
    const routeMap: Record<string, string> = {
      dashboard: '/admin',
      projects: '/admin/projects',
      expenses: '/admin/expenses',
      disputes: '/admin/disputes',
    };
    if (routeMap[value]) {
      navigate(routeMap[value]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const todoItems = [
    {
      id: 1,
      icon: <FileCheck2 className="w-5 h-5" />,
      iconBg: 'bg-warning-100 text-warning-600',
      label: '待审核凭证',
      value: pendingExpenses,
      unit: '笔',
      desc: '等待审核员核验支出凭证',
      action: '前往审核',
      onClick: () => navigate('/admin/expenses'),
    },
    {
      id: 2,
      icon: <MessageSquareWarning className="w-5 h-5" />,
      iconBg: 'bg-danger-100 text-danger-600',
      label: '待回复质疑',
      value: openDisputes,
      unit: '条',
      desc: '捐赠人对支出提出的质疑',
      action: '立即回复',
      onClick: () => navigate('/admin/disputes'),
    },
    {
      id: 3,
      icon: <ClipboardList className="w-5 h-5" />,
      iconBg: 'bg-primary-100 text-primary-600',
      label: '待处理申请',
      value: 3,
      unit: '份',
      desc: '新项目筹款待审核',
      action: '查看申请',
      onClick: () => {},
    },
    {
      id: 4,
      icon: <Clock className="w-5 h-5" />,
      iconBg: 'bg-secondary-100 text-secondary-600',
      label: '存在异常',
      value: disputedItems,
      unit: '笔',
      desc: '支出凭证存在质疑待处理',
      action: '排查异常',
      onClick: () => navigate('/admin/expenses'),
    },
  ];

  const timelineItems: VerticalTimelineItem[] = [
    {
      id: 1,
      type: 'success',
      title: '新增支出"第二批儿童保暖物资补充采购"已通过审核',
      description: `审核员 李主任 · ${formatAmountShort(24500)} · 项目: ${mainProject.title.slice(0, 12)}...`,
      time: formatDate('2025-11-22T14:00:00.000Z', 'relative'),
    },
    {
      id: 2,
      type: 'warning',
      title: '质疑"项目管理费用支出合理性"有新回复',
      description: '捐赠人补充了新的意见，建议及时跟进沟通',
      time: formatDate('2025-11-10T08:30:00.000Z', 'relative'),
      extra: (
        <div className="inline-flex items-center gap-1.5">
          <Badge variant="warning">关注中</Badge>
        </div>
      ),
    },
    {
      id: 3,
      type: 'pending',
      title: '"志愿者赴山区执行费用(第一批)"已提交审核',
      description: '凭证已上传，等待审核员核验',
      time: formatDate('2025-11-25T17:00:00.000Z', 'relative'),
    },
    {
      id: 4,
      type: 'info',
      title: '项目进度更新已发布',
      description: '完成物资第一轮发放，覆盖云南怒江州8所小学',
      time: formatDate('2025-11-18T10:00:00.000Z', 'relative'),
    },
    {
      id: 5,
      type: 'success',
      title: '月度公示报告已自动生成',
      description: '11月项目财务报告，包含12笔支出明细汇总',
      time: formatDate('2025-11-01T00:00:00.000Z', 'relative'),
    },
  ];

  return (
    <div className={`flex min-h-screen bg-slate-50/50 ${className ?? ''}`}>
      <AdminSidebar
        value={activeNav}
        onChange={handleNavChange}
        items={customNavItems}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        orgName={currentUser?.orgName ?? '某公益基金会'}
        orgAvatar={currentUser?.avatar}
        onLogout={handleLogout}
      />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-100/80 bg-white/60 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">数据看板</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser?.orgName} · 欢迎回来，{currentUser?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={() => navigate('/admin/projects')}
            >
              新建项目
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="累计筹款"
              value={totalRaised}
              prefix="¥"
              suffix=""
              icon={<Heart className="w-5 h-5" />}
              iconBgClass="bg-gradient-to-br from-primary-500 to-primary-600"
              trend={{
                direction: 'up',
                value: '+12.3%',
                label: '较上月',
              }}
              onClick={() => navigate('/admin/projects')}
            />
            <StatCard
              title="爱心捐赠人"
              value={totalDonors}
              suffix="人"
              icon={<Users className="w-5 h-5" />}
              iconBgClass="bg-gradient-to-br from-secondary-500 to-secondary-600"
              trend={{
                direction: 'up',
                value: '+8.6%',
                label: '本周新增',
              }}
            />
            <StatCard
              title="已支出金额"
              value={totalExpensed}
              prefix="¥"
              icon={<Receipt className="w-5 h-5" />}
              iconBgClass="bg-gradient-to-br from-warning-500 to-warning-600"
              trend={{
                direction: 'neutral',
                value: '68.2%',
                label: '支出比例',
              }}
              onClick={() => navigate('/admin/expenses')}
            />
            <StatCard
              title="待处理事项"
              value={pendingExpenses + openDisputes}
              suffix="项"
              icon={<AlertOctagon className="w-5 h-5" />}
              iconBgClass="bg-gradient-to-br from-danger-500 to-danger-600"
              description={`${pendingExpenses}笔待审核 · ${openDisputes}条待回复`}
              onClick={() => navigate('/admin/disputes')}
            />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 space-y-5">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-primary-500" />
                        待办事项
                      </CardTitle>
                      <CardDescription>需要您关注和处理的重要事项</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      查看全部
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {todoItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={item.onClick}
                        className="group relative p-4 rounded-xl border border-slate-100 bg-white/50 hover:bg-white hover:border-slate-200 hover:shadow-soft transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${item.iconBg}`}
                          >
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-semibold text-slate-800">
                                {item.label}
                              </span>
                              <div className="flex items-baseline gap-0.5 shrink-0">
                                <span className="text-2xl font-bold text-slate-800 tabular-nums">
                                  {item.value}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                  {item.unit}
                                </span>
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                              {item.desc}
                            </p>
                            <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary-600 group-hover:text-primary-700">
                              {item.action}
                              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                            </div>
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
                        <Activity className="w-4 h-4 text-secondary-500" />
                        最近动态
                      </CardTitle>
                      <CardDescription>项目相关的重要操作和事件</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <VerticalTimeline items={timelineItems} animate />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FolderPlus className="w-4 h-4 text-primary-500" />
                    正在筹款
                  </CardTitle>
                  <CardDescription>当前进行中的公益项目</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.map((project) => {
                      const progress = Math.min(
                        100,
                        (project.raisedAmount / project.targetAmount) * 100
                      );
                      return (
                        <div
                          key={project.id}
                          className="p-3 rounded-xl border border-slate-100 bg-white/50 hover:bg-white transition-colors cursor-pointer"
                          onClick={() => navigate('/admin/projects')}
                        >
                          <div className="flex gap-3">
                            <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden">
                              <img
                                src={project.coverImage}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-800 line-clamp-1">
                                {project.title}
                              </div>
                              <div className="mt-1.5 flex items-baseline gap-1">
                                <span className="text-lg font-bold text-primary-600 tabular-nums">
                                  {formatAmountShort(project.raisedAmount)}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  / {formatAmountShort(project.targetAmount)}
                                </span>
                              </div>
                              <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Receipt className="w-4 h-4 text-warning-500" />
                    支出概览
                  </CardTitle>
                  <CardDescription>近期支出状态统计</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50/50">
                      <div className="flex items-center gap-2.5">
                        <Badge variant="approved" showIcon />
                        <span className="text-sm text-slate-700">已通过</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800 tabular-nums">
                        {approvedExpenses} 笔
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-warning-50/50">
                      <div className="flex items-center gap-2.5">
                        <Badge variant="pending" showIcon />
                        <span className="text-sm text-slate-700">待审核</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800 tabular-nums">
                        {pendingExpenses} 笔
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-danger-50/50">
                      <div className="flex items-center gap-2.5">
                        <Badge variant="warning" showIcon />
                        <span className="text-sm text-slate-700">异常/争议</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800 tabular-nums">
                        {disputedItems} 笔
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
