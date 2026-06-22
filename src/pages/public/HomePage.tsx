import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Users,
  HandHeart,
  Target,
  ChevronRight,
  Calendar,
  MapPin,
  Award,
  Trophy,
  Medal,
  User as UserIcon,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { StatCard } from '@/components/charts/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PROJECT_ID } from '@/data/projects';
import { useDataStore } from '@/store/dataStore';
import { formatAmountShort, formatAmount, formatDate, formatDaysRemaining } from '@/utils/formatter';
import { anonymizeName } from '@/utils/anonymizer';
import ExpenseDetailModal from './ExpenseDetailModal';
import type { Expense } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const project = useDataStore((state) => state.getProjectById(PROJECT_ID));
  const calculateTotalRaised = useDataStore((state) => state.calculateTotalRaised);
  const calculateTotalExpenses = useDataStore((state) => state.calculateTotalExpenses);
  const calculateDonorCount = useDataStore((state) => state.calculateDonorCount);
  const getRecentExpenses = useDataStore((state) => state.getRecentExpenses);
  const getProgressByProject = useDataStore((state) => state.getProgressByProject);
  const getTopDonations = useDataStore((state) => state.getTopDonations);

  const totalRaised = useMemo(() => calculateTotalRaised(PROJECT_ID), [calculateTotalRaised]);
  const totalExpenses = useMemo(() => calculateTotalExpenses(PROJECT_ID, true), [calculateTotalExpenses]);
  const donorCount = useMemo(() => calculateDonorCount(PROJECT_ID), [calculateDonorCount]);
  const recentExpenses = useMemo(() => getRecentExpenses(PROJECT_ID, 5), [getRecentExpenses]);
  const progressList = useMemo(() => getProgressByProject(PROJECT_ID), [getProgressByProject]);
  const topDonations = useMemo(() => getTopDonations(PROJECT_ID, 10), [getTopDonations]);

  const progressPercent = project ? Math.min(100, (totalRaised / project.targetAmount) * 100) : 0;
  const daysRemaining = project ? formatDaysRemaining(project.endTime) : 0;

  const expenseBadgeVariant = (status: Expense['status']) => {
    switch (status) {
      case 'approved':
        return 'approved';
      case 'pending':
        return 'pending';
      case 'rejected':
        return 'rejected';
      case 'disputed':
        return 'warning';
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Medal className="w-4 h-4 text-slate-400" />;
    if (index === 2) return <Award className="w-4 h-4 text-amber-600" />;
    return <span className="w-4 h-4 inline-flex items-center justify-center text-xs font-bold text-slate-400">{index + 1}</span>;
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">项目不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-secondary-50/30">
      <PublicHeader />

      <section className="relative pt-24 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${project.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/70 to-slate-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-wrap gap-2">
                {project.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 text-primary-700 border border-primary-200/60 backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                {project.title}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>剩余 {daysRemaining} 天</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  <span>{project.organizer}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" onClick={() => navigate(`/project/${project.id}`)}>
                  查看项目详情
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline">
                  我要捐赠
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="glass card-rounded-lg p-8 shadow-glass-hover">
                <div className="flex flex-col items-center text-center">
                  <ProgressRing
                    progress={progressPercent}
                    size={180}
                    strokeWidth={14}
                    color="primary"
                    label={
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-gradient-primary">
                          {progressPercent.toFixed(1)}%
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">募资进度</span>
                      </div>
                    }
                  />
                  <div className="w-full mt-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">已筹金额</span>
                      <span className="text-xl font-bold text-slate-800">
                        {formatAmountShort(totalRaised)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">目标金额</span>
                      <span className="text-base font-medium text-slate-600">
                        {formatAmountShort(project.targetAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">爱心人士</span>
                      <span className="text-base font-medium text-slate-600">
                        {donorCount.toLocaleString()} 人
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="累计筹款"
            value={Math.round(totalRaised)}
            prefix="¥"
            icon={<HandHeart className="w-5 h-5" />}
            iconBgClass="bg-gradient-to-br from-primary-500 to-primary-600"
            trend={{ direction: 'up', value: '12.5%', label: '较上周' }}
            description="所有捐赠人累计捐赠"
          />
          <StatCard
            title="累计支出"
            value={Math.round(totalExpenses)}
            prefix="¥"
            icon={<Target className="w-5 h-5" />}
            iconBgClass="bg-gradient-to-br from-secondary-500 to-secondary-600"
            trend={{ direction: 'up', value: '8.3%', label: '较上周' }}
            description="已审核通过的支出"
          />
          <StatCard
            title="捐赠人次"
            value={donorCount}
            suffix="人"
            icon={<Users className="w-5 h-5" />}
            iconBgClass="bg-gradient-to-br from-warning-500 to-warning-600"
            trend={{ direction: 'up', value: '156', label: '今日新增' }}
            description="参与捐赠的爱心人士"
          />
          <StatCard
            title="受益儿童"
            value={project.beneficiaryCount}
            suffix="人"
            icon={<Heart className="w-5 h-5" />}
            iconBgClass="bg-gradient-to-br from-rose-500 to-rose-600"
            description={project.beneficiary}
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary-600" />
                  最近支出明细
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">每一笔支出都公开透明，可追溯可核查</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/project/${project.id}`)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                查看全部
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative pl-2">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />
                <ul className="space-y-5">
                  {recentExpenses.map((expense, index) => (
                    <li
                      key={expense.id}
                      className={cn(
                        'relative group cursor-pointer',
                        'animate-fade-in-up'
                      )}
                      style={{ animationDelay: `${index * 80}ms` }}
                      onClick={() => setSelectedExpense(expense)}
                    >
                      {index !== recentExpenses.length - 1 && (
                        <div className="absolute left-[15px] top-10 w-0.5 -ml-px h-[calc(100%-16px)] bg-primary-200" />
                      )}
                      <div className="flex items-start gap-4">
                        <div className="relative z-10 shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center ring-4 ring-primary-100 text-white shadow-soft">
                          <Target className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5 group-hover:bg-primary-50/50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-semibold text-slate-800 truncate">
                                  {expense.title}
                                </h4>
                                <Badge variant={expenseBadgeVariant(expense.status)}>
                                  {expense.status === 'approved' && '已审核'}
                                  {expense.status === 'pending' && '待审核'}
                                  {expense.status === 'rejected' && '已驳回'}
                                  {expense.status === 'disputed' && '有质疑'}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">
                                {expense.category} · {expense.recipientName}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-base font-bold text-slate-800">
                                {formatAmount(expense.amount)}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {formatDate(expense.createdAt, 'short')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning-600" />
                  爱心榜单 TOP10
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">感谢每一位爱心人士的付出</p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {topDonations.map((donation, index) => (
                  <li
                    key={donation.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="shrink-0 w-7 h-7 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                    <div
                      className={cn(
                        'shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-soft',
                        donation.isAnonymous
                          ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                          : 'bg-gradient-to-br from-primary-400 to-primary-500'
                      )}
                    >
                      {donation.isAnonymous ? (
                        <Heart className="w-4 h-4" />
                      ) : (
                        <UserIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {donation.isAnonymous ? '匿名爱心人士' : anonymizeName(donation.donorName)}
                      </div>
                      {donation.message && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{donation.message}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-800">
                        {formatAmountShort(donation.amount)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              受助进展
            </h2>
            <p className="text-sm text-slate-500 mt-1">关注每一步爱心传递的脚步</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/project/${project.id}`)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            查看全部
          </Button>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
          {progressList.map((progress, index) => (
            <Card
              key={progress.id}
              className={cn(
                'shrink-0 w-80 snap-start overflow-hidden cursor-pointer group',
                'animate-fade-in-up'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(`/project/${project.id}`)}
            >
              {progress.images[0] && (
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={progress.images[0]}
                    alt={progress.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {progress.isImportant && (
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-danger-500 text-white shadow-soft">
                      <Trophy className="w-3 h-3" />
                      重要进展
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-primary-700 transition-colors">
                  {progress.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {progress.content}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(progress.createdAt, 'date')}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {progress.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {progress.comments}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <ExpenseDetailModal
        open={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
      />
    </div>
  );
}
