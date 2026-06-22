import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  ChevronDown,
  Receipt,
  Building2,
  Image as ImageIcon,
  MessageCircle,
  ThumbsUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { StatCard } from '@/components/charts/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs, TabContent } from '@/components/ui/Tabs';
import { VerticalTimeline, type VerticalTimelineItem } from '@/components/timeline/VerticalTimeline';
import { useDataStore } from '@/store/dataStore';
import { formatAmountShort, formatAmount, formatDate, formatDaysRemaining } from '@/utils/formatter';
import { anonymizeName } from '@/utils/anonymizer';
import ExpenseDetailModal from './ExpenseDetailModal';
import type { Expense, ProgressUpdate } from '@/types';

type TabValue = 'donations' | 'expenses' | 'progress' | 'ranking';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>('donations');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [sortDonation, setSortDonation] = useState<'amount' | 'time'>('amount');
  const [sortExpense, setSortExpense] = useState<'amount' | 'time'>('time');

  const project = useDataStore((state) => state.getProjectById(id ?? ''));
  const calculateTotalRaised = useDataStore((state) => state.calculateTotalRaised);
  const calculateTotalExpenses = useDataStore((state) => state.calculateTotalExpenses);
  const calculateDonorCount = useDataStore((state) => state.calculateDonorCount);
  const getDonationsByProject = useDataStore((state) => state.getDonationsByProject);
  const getExpensesByProject = useDataStore((state) => state.getExpensesByProject);
  const getProgressByProject = useDataStore((state) => state.getProgressByProject);
  const getTopDonations = useDataStore((state) => state.getTopDonations);

  const totalRaised = useMemo(
    () => calculateTotalRaised(id ?? ''),
    [calculateTotalRaised, id]
  );
  const totalExpenses = useMemo(
    () => calculateTotalExpenses(id ?? '', true),
    [calculateTotalExpenses, id]
  );
  const donorCount = useMemo(() => calculateDonorCount(id ?? ''), [calculateDonorCount, id]);
  const donations = useMemo(() => getDonationsByProject(id ?? ''), [getDonationsByProject, id]);
  const expenses = useMemo(() => getExpensesByProject(id ?? ''), [getExpensesByProject, id]);
  const progressList = useMemo(
    () => getProgressByProject(id ?? ''),
    [getProgressByProject, id]
  );
  const top20Donations = useMemo(
    () => getTopDonations(id ?? '', 20),
    [getTopDonations, id]
  );

  const progressPercent = project ? Math.min(100, (totalRaised / project.targetAmount) * 100) : 0;
  const daysRemaining = project ? formatDaysRemaining(project.endTime) : 0;

  const sortedDonations = useMemo(() => {
    const list = [...donations];
    if (sortDonation === 'amount') {
      list.sort((a, b) => b.amount - a.amount);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [donations, sortDonation]);

  const sortedExpenses = useMemo(() => {
    const list = [...expenses];
    if (sortExpense === 'amount') {
      list.sort((a, b) => b.amount - a.amount);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [expenses, sortExpense]);

  const progressTimelineItems = useMemo(() => {
    return progressList.map((progress: ProgressUpdate): VerticalTimelineItem => ({
      id: progress.id,
      title: progress.title,
      description: (
        <div className="space-y-3">
          <p className="leading-relaxed">{progress.content}</p>
          {progress.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {progress.images.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"
                >
                  <img
                    src={img}
                    alt={`${progress.title}-${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              {progress.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {progress.comments}
            </span>
            <span>by {progress.author}</span>
          </div>
        </div>
      ),
      time: formatDate(progress.createdAt, 'date'),
      type: (progress.isImportant ? 'success' : 'info') as 'success' | 'info',
      icon: progress.isImportant ? <Trophy className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />,
    }));
  }, [progressList]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Medal className="w-4 h-4 text-slate-400" />;
    if (index === 2) return <Award className="w-4 h-4 text-amber-600" />;
    return (
      <span className="w-4 h-4 inline-flex items-center justify-center text-xs font-bold text-slate-400">
        {index + 1}
      </span>
    );
  };

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

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">项目不存在</p>
        <Button variant="outline" onClick={() => navigate('/')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          返回首页
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-secondary-50/30">
      <PublicHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回看板首页
        </button>

        <Card className="mb-6 overflow-hidden">
          <div className="grid lg:grid-cols-5 gap-0">
            <div className="lg:col-span-3 p-8 space-y-5">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {project.title}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>剩余 {daysRemaining} 天</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{project.organizer}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>受益对象：{project.beneficiary}</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 p-8 border-t lg:border-t-0 lg:border-l border-slate-100 bg-gradient-to-br from-primary-50/30 to-secondary-50/30">
              <div className="flex h-full flex-col items-center justify-center text-center gap-5">
                <ProgressRing
                  progress={progressPercent}
                  size={160}
                  strokeWidth={12}
                  color="primary"
                  label={
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-gradient-primary">
                        {progressPercent.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">募资进度</span>
                    </div>
                  }
                />
                <div className="w-full grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">已筹</div>
                    <div className="text-base font-bold text-slate-800">
                      {formatAmountShort(totalRaised)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">目标</div>
                    <div className="text-sm font-medium text-slate-600">
                      {formatAmountShort(project.targetAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">爱心</div>
                    <div className="text-sm font-medium text-slate-600">
                      {donorCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="累计筹款"
            value={Math.round(totalRaised)}
            prefix="¥"
            icon={<HandHeart className="w-5 h-5" />}
            iconBgClass="bg-gradient-to-br from-primary-500 to-primary-600"
          />
          <StatCard
            title="累计支出"
            value={Math.round(totalExpenses)}
            prefix="¥"
            icon={<Target className="w-5 h-5" />}
            iconBgClass="bg-gradient-to-br from-secondary-500 to-secondary-600"
          />
          <StatCard
            title="捐赠人次"
            value={donorCount}
            suffix="人"
            icon={<Users className="w-5 h-5" />}
            iconBgClass="bg-gradient-to-br from-warning-500 to-warning-600"
          />
          <StatCard
            title="受益人数"
            value={project.beneficiaryCount}
            suffix="人"
            icon={<Heart className="w-5 h-5" />}
            iconBgClass="bg-gradient-to-br from-rose-500 to-rose-600"
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs
              value={activeTab}
              onChange={(v) => setActiveTab(v as TabValue)}
              tabs={[
                {
                  value: 'donations',
                  label: '募资明细',
                  icon: <Heart className="w-4 h-4" />,
                },
                {
                  value: 'expenses',
                  label: '支出明细',
                  icon: <Receipt className="w-4 h-4" />,
                },
                {
                  value: 'progress',
                  label: '受助进展',
                  icon: <Eye className="w-4 h-4" />,
                },
                {
                  value: 'ranking',
                  label: '捐赠榜单',
                  icon: <Trophy className="w-4 h-4" />,
                },
              ]}
            >
              <TabContent value="donations" activeValue={activeTab}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      共 {donations.length} 笔捐赠记录
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">排序：</span>
                      <button
                        onClick={() => setSortDonation('amount')}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                          sortDonation === 'amount'
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-100'
                        )}
                      >
                        金额
                        {sortDonation === 'amount' && <ChevronDown className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => setSortDonation('time')}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                          sortDonation === 'time'
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-100'
                        )}
                      >
                        时间
                        {sortDonation === 'time' && <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                            捐赠人
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                            留言
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                            金额
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                            时间
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedDonations.map((donation, index) => (
                          <tr
                            key={donation.id}
                            className="hover:bg-primary-50/30 transition-colors animate-fade-in-up"
                            style={{ animationDelay: `${index * 20}ms` }}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={cn(
                                    'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-soft',
                                    donation.isAnonymous
                                      ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                                      : 'bg-gradient-to-br from-primary-400 to-primary-500'
                                  )}
                                >
                                  {donation.isAnonymous ? (
                                    <Heart className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserIcon className="w-3.5 h-3.5" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-800">
                                    {donation.isAnonymous
                                      ? '匿名爱心人士'
                                      : anonymizeName(donation.donorName)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-slate-500 text-xs line-clamp-1 max-w-xs">
                                {donation.message || '-'}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-800">
                              {formatAmount(donation.amount)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-slate-400">
                              {formatDate(donation.createdAt, 'short')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabContent>

              <TabContent value="expenses" activeValue={activeTab}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      共 {expenses.length} 笔支出记录
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">排序：</span>
                      <button
                        onClick={() => setSortExpense('amount')}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                          sortExpense === 'amount'
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-100'
                        )}
                      >
                        金额
                        {sortExpense === 'amount' && <ChevronDown className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => setSortExpense('time')}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                          sortExpense === 'time'
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-100'
                        )}
                      >
                        时间
                        {sortExpense === 'time' && <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                            支出项目
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                            类别
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                            收款方
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                            状态
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                            金额
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                            时间
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedExpenses.map((expense, index) => (
                          <tr
                            key={expense.id}
                            onClick={() => setSelectedExpense(expense)}
                            className="hover:bg-primary-50/30 transition-colors cursor-pointer animate-fade-in-up"
                            style={{ animationDelay: `${index * 20}ms` }}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-800 truncate max-w-xs">
                                  {expense.title}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-slate-600">{expense.category}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-slate-600 truncate max-w-[140px] inline-block">
                                {expense.recipientName}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={expenseBadgeVariant(expense.status)}>
                                {expense.status === 'approved' && '已审核'}
                                {expense.status === 'pending' && '待审核'}
                                {expense.status === 'rejected' && '已驳回'}
                                {expense.status === 'disputed' && '有质疑'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-800">
                              {formatAmount(expense.amount)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-slate-400">
                              {formatDate(expense.createdAt, 'short')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabContent>

              <TabContent value="progress" activeValue={activeTab}>
                {progressTimelineItems.length > 0 ? (
                  <VerticalTimeline items={progressTimelineItems} />
                ) : (
                  <div className="py-16 text-center text-slate-400">
                    <Eye className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">暂无受助进展</p>
                  </div>
                )}
              </TabContent>

              <TabContent value="ranking" activeValue={activeTab}>
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">
                    爱心捐赠榜 TOP20，感谢每一位爱心人士的慷慨解囊
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {top20Donations.map((donation, index) => (
                      <div
                        key={donation.id}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-2xl transition-all animate-fade-in-up',
                          index < 3
                            ? 'bg-gradient-to-r from-primary-50/60 to-secondary-50/40 border border-primary-100'
                            : 'bg-white border border-slate-100 hover:border-primary-100 hover:bg-primary-50/20'
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                          {getRankIcon(index)}
                        </div>
                        <div
                          className={cn(
                            'shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-soft',
                            donation.isAnonymous
                              ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                              : index < 3
                              ? 'bg-gradient-to-br from-warning-400 to-warning-500'
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
                          <div className="text-sm font-semibold text-slate-800 truncate">
                            {donation.isAnonymous
                              ? '匿名爱心人士'
                              : anonymizeName(donation.donorName)}
                          </div>
                          {donation.message && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {donation.message}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className={cn(
                              'font-bold',
                              index < 3 ? 'text-lg text-primary-700' : 'text-base text-slate-800'
                            )}
                          >
                            {formatAmountShort(donation.amount)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {formatDate(donation.createdAt, 'short')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <ExpenseDetailModal
        open={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
      />
    </div>
  );
}
