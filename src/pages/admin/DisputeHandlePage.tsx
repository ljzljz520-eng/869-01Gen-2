import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  Search,
  Eye,
  MessageSquare,
  UserCircle,
  Clock,
  ChevronRight,
  Send,
  FileEdit,
  Hash,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FolderPlus,
  Receipt,
} from 'lucide-react';
import {
  AdminSidebar,
  type SidebarNavItem,
} from '@/components/layout/AdminSidebar';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { useAuthStore } from '@/store/authStore';
import type { Dispute, DisputeSeverity, CorrectionRecord } from '@/types';
import { disputes as initialDisputes } from '@/data/disputes';
import { expenses } from '@/data/expenses';
import { projects } from '@/data/projects';
import { formatDate } from '@/utils/formatter';
import { cn } from '@/lib/utils';

type CorrectionType = 'amount' | 'description' | 'voucher' | 'other';

interface ReplyFormData {
  content: string;
  hasCorrection: boolean;
  correctionType: CorrectionType;
  correctionField: string;
  correctionOldValue: string;
  correctionNewValue: string;
  correctionReason: string;
}

const DisputeHandlePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const [activeNav, setActiveNav] = React.useState('disputes');
  const [collapsed, setCollapsed] = React.useState(false);
  const [disputeList, setDisputeList] = React.useState<Dispute[]>([
    ...initialDisputes,
    {
      id: 'dispute-002',
      projectId: projects[0].id,
      expenseId: 'exp-006',
      title: '志愿者执行费用明细质疑',
      description:
        '关注到"志愿者赴山区执行费用（第一批）"12800元的支出，请问费用的具体明细是什么？每位志愿者的交通、住宿标准是多少？另外志愿者补贴的标准是按照什么规定执行的？建议在支出页面直接附上费用明细清单，便于公众监督。',
      submitterName: '爱心捐赠人小王',
      submitterEmail: 'w***@example.com',
      status: 'open',
      severity: 'low',
      category: 'expense_irregularity',
      evidenceUrls: [],
      replies: [],
      createdAt: '2025-11-26T10:30:00.000Z',
      updatedAt: '2025-11-26T10:30:00.000Z',
    },
    {
      id: 'dispute-003',
      projectId: projects[0].id,
      expenseId: undefined,
      title: '关于项目受益人数量核实的请求',
      description:
        '项目介绍说受益人是1200余名儿童，但从支出明细来看，第一批羽绒服只采购了400件，保暖内衣600套，加起来还不到1000人份。请问是分批发放还是有什么原因？能否公布每所学校具体的受益人名单和签收记录？',
      submitterName: '公益监督志愿者',
      status: 'in_progress',
      severity: 'medium',
      category: 'progress_false',
      evidenceUrls: [],
      replies: [
        {
          id: 'reply-005',
          disputeId: 'dispute-003',
          author: '阳光公益基金会',
          authorRole: 'organizer',
          content:
            '感谢您的细心监督！物资是分批采购和发放的，原因如下：1. 各学校开学时间不同，按批次发放便于配合学校教学安排；2. 部分极寒高海拔地区学校需要额外的加厚款，采购周期稍长。目前第一批已覆盖8所学校1000名儿童，剩余物资正在运输中，预计本周内完成全部发放。详细的受益人名单和签收表正在整理，将在3个工作日内附上。',
          createdAt: '2025-11-24T09:00:00.000Z',
        },
      ],
      createdAt: '2025-11-23T15:20:00.000Z',
      updatedAt: '2025-11-24T09:00:00.000Z',
    },
  ]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('pending');
  const [replyModalOpen, setReplyModalOpen] = React.useState(false);
  const [selectedDispute, setSelectedDispute] = React.useState<Dispute | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [correctionRecords, setCorrectionRecords] = React.useState<CorrectionRecord[]>([]);

  const [replyForm, setReplyForm] = React.useState<ReplyFormData>({
    content: '',
    hasCorrection: false,
    correctionType: 'description',
    correctionField: '',
    correctionOldValue: '',
    correctionNewValue: '',
    correctionReason: '',
  });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const customNavItems: SidebarNavItem[] = React.useMemo(
    () => [
      { value: 'dashboard', label: '数据看板', icon: <ClipboardList className="w-5 h-5" /> },
      { value: 'projects', label: '项目管理', icon: <FolderPlus className="w-5 h-5" /> },
      {
        value: 'applications',
        label: '筹款申请',
        icon: <ClipboardList className="w-5 h-5" />,
        badge: 3,
        badgeClass: 'bg-warning-500 text-white',
      },
      { value: 'expenses', label: '支出管理', icon: <Receipt className="w-5 h-5" /> },
      {
        value: 'disputes',
        label: '质疑处理',
        icon: <AlertOctagon className="w-5 h-5" />,
        badge:
          disputeList.filter((d) => d.status === 'open' || d.status === 'in_progress').length > 0
            ? disputeList.filter((d) => d.status === 'open' || d.status === 'in_progress').length
            : undefined,
        badgeClass: 'bg-danger-500 text-white',
      },
    ],
    [disputeList]
  );

  const handleNavChange = (value: string) => {
    setActiveNav(value);
    const routeMap: Record<string, string> = {
      dashboard: '/admin',
      projects: '/admin/projects',
      expenses: '/admin/expenses',
      disputes: '/admin/disputes',
    };
    if (routeMap[value]) navigate(routeMap[value]);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const filteredDisputes = React.useMemo(() => {
    return disputeList.filter((d) => {
      const matchSearch =
        !searchQuery ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.submitterName.toLowerCase().includes(searchQuery.toLowerCase());

      let matchStatus = true;
      if (statusFilter === 'pending') {
        matchStatus = d.status === 'open' || d.status === 'in_progress';
      } else if (statusFilter === 'resolved') {
        matchStatus = d.status === 'resolved' || d.status === 'closed';
      }
      return matchSearch && matchStatus;
    });
  }, [disputeList, searchQuery, statusFilter]);

  const pendingCount = disputeList.filter(
    (d) => d.status === 'open' || d.status === 'in_progress'
  ).length;
  const resolvedCount = disputeList.filter(
    (d) => d.status === 'resolved' || d.status === 'closed'
  ).length;

  const getSeverityConfig = (
    severity: DisputeSeverity
  ): { wrapper: string; label: string; dot: string } => {
    switch (severity) {
      case 'high':
        return {
          wrapper: 'bg-danger-50 text-danger-700 border-danger-200',
          label: '高关注度',
          dot: 'bg-danger-500',
        };
      case 'medium':
        return {
          wrapper: 'bg-warning-50 text-warning-700 border-warning-200',
          label: '中关注度',
          dot: 'bg-warning-500',
        };
      case 'low':
      default:
        return {
          wrapper: 'bg-secondary-50 text-secondary-700 border-secondary-200',
          label: '一般',
          dot: 'bg-secondary-500',
        };
    }
  };

  const getStatusConfig = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
        return { variant: 'pending' as const, label: '待回复' };
      case 'in_progress':
        return { variant: 'pending' as const, label: '处理中' };
      case 'resolved':
        return { variant: 'approved' as const, label: '已解决' };
      case 'closed':
        return { variant: 'approved' as const, label: '已关闭' };
      default:
        return { variant: 'pending' as const, label: status };
    }
  };

  const getCategoryLabel = (category: Dispute['category']): string => {
    const labels: Record<Dispute['category'], string> = {
      expense_irregularity: '支出异常',
      fund_misuse: '资金滥用',
      progress_false: '进度不实',
      other: '其他问题',
    };
    return labels[category];
  };

  const openReplyModal = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setReplyForm({
      content: '',
      hasCorrection: false,
      correctionType: 'description',
      correctionField: '',
      correctionOldValue: '',
      correctionNewValue: '',
      correctionReason: '',
    });
    setFormErrors({});
    setReplyModalOpen(true);
  };

  const getCorrectionTypeOptions = (): {
    value: CorrectionType;
    label: string;
    desc: string;
  }[] => [
    { value: 'amount', label: '金额修正', desc: '支出金额填写错误需更正' },
    { value: 'description', label: '描述修正', desc: '支出说明/描述需要补充' },
    { value: 'voucher', label: '凭证补充', desc: '漏传/错传凭证需重新上传' },
    { value: 'other', label: '其他修正', desc: '其他需要更正的信息' },
  ];

  const correctionTypeOptions = getCorrectionTypeOptions();

  const handleCorrectionTypeChange = (type: CorrectionType) => {
    let field = '';
    if (selectedDispute?.expenseId) {
      const expense = expenses.find((e) => e.id === selectedDispute.expenseId);
      if (expense) {
        switch (type) {
          case 'amount':
            field = '支出金额';
            setReplyForm((prev) => ({
              ...prev,
              correctionType: type,
              correctionField: field,
              correctionOldValue: expense.amount.toLocaleString(),
            }));
            return;
          case 'description':
            field = '支出说明';
            setReplyForm((prev) => ({
              ...prev,
              correctionType: type,
              correctionField: field,
              correctionOldValue: expense.description,
            }));
            return;
          case 'voucher':
            field = '支出凭证';
            setReplyForm((prev) => ({
              ...prev,
              correctionType: type,
              correctionField: field,
              correctionOldValue: `${expense.voucherUrls.length} 个附件`,
            }));
            return;
          default:
            field = '';
        }
      }
    }
    setReplyForm((prev) => ({
      ...prev,
      correctionType: type,
      correctionField: field,
      correctionOldValue: '',
    }));
  };

  const validateReplyForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!replyForm.content.trim()) {
      errors.content = '请填写回复内容';
    }
    if (replyForm.content.trim().length < 10) {
      errors.content = '回复内容至少需要10个字符，请详细说明';
    }
    if (replyForm.hasCorrection) {
      if (!replyForm.correctionField.trim()) {
        errors.correctionField = '请填写修正字段名称';
      }
      if (!replyForm.correctionNewValue.trim()) {
        errors.correctionNewValue = '请填写修正后的新值';
      }
      if (!replyForm.correctionReason.trim()) {
        errors.correctionReason = '请说明修正原因';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitReply = async () => {
    if (!selectedDispute || !validateReplyForm()) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const now = new Date().toISOString();
    const replyId = `reply-${Date.now()}`;

    const newReply = {
      id: replyId,
      disputeId: selectedDispute.id,
      author: currentUser?.orgName ?? '机构',
      authorRole: 'organizer' as const,
      content: replyForm.content,
      createdAt: now,
    };

    let newCorrectionRecord: CorrectionRecord | null = null;
    if (replyForm.hasCorrection) {
      newCorrectionRecord = {
        id: `corr-${Date.now()}`,
        relatedId: selectedDispute.expenseId ?? selectedDispute.projectId,
        relatedType: selectedDispute.expenseId ? 'expense' : 'project',
        fieldName: replyForm.correctionField,
        oldValue: replyForm.correctionOldValue,
        newValue: replyForm.correctionNewValue,
        reason: replyForm.correctionReason,
        operator: currentUser?.name ?? '机构管理员',
        operatorRole: currentUser?.role ?? 'org_admin',
        createdAt: now,
      };
      setCorrectionRecords((prev) =>
        newCorrectionRecord ? [newCorrectionRecord, ...prev] : prev
      );
    }

    setDisputeList((prev) =>
      prev.map((d) =>
        d.id === selectedDispute.id
          ? {
              ...d,
              status: 'in_progress',
              replies: [...d.replies, newReply],
              updatedAt: now,
            }
          : d
      )
    );

    setSubmitting(false);
    setReplyModalOpen(false);
  };

  const inputClass = (field: string) =>
    cn(
      'w-full h-11 px-4 rounded-xl border-2 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400',
      'transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50',
      formErrors[field]
        ? 'border-danger-300 focus:border-danger-400 focus:ring-danger-100/50'
        : 'border-slate-200'
    );

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar
        value={activeNav}
        onChange={handleNavChange}
        items={customNavItems}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        orgName={currentUser?.orgName}
        orgAvatar={currentUser?.avatar}
        onLogout={handleLogout}
      />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-100/80 bg-white/60 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">质疑处理</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              回应捐赠人疑问，维护公益透明度
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500">待处理</div>
                  <div className="mt-1.5 text-xl font-bold text-slate-800 tabular-nums">
                    {pendingCount} 条
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-warning-100 text-warning-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500">已解决</div>
                  <div className="mt-1.5 text-xl font-bold text-slate-800 tabular-nums">
                    {resolvedCount} 条
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500">累计修正</div>
                  <div className="mt-1.5 text-xl font-bold text-slate-800 tabular-nums">
                    {correctionRecords.length} 条
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-secondary-100 text-secondary-600 flex items-center justify-center">
                  <FileEdit className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </section>

          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索质疑标题、描述或提交人..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50"
                />
              </div>
              <Tabs
                variant="pills"
                tabs={[
                  { value: 'pending', label: `待处理 (${pendingCount})` },
                  { value: 'resolved', label: `已解决 (${resolvedCount})` },
                  { value: 'all', label: `全部 (${disputeList.length})` },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full lg:w-auto"
              />
            </div>
          </Card>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredDisputes.map((dispute) => {
              const severity = getSeverityConfig(dispute.severity);
              const status = getStatusConfig(dispute.status);
              const linkedExpense = dispute.expenseId
                ? expenses.find((e) => e.id === dispute.expenseId)
                : null;
              const linkedProject = projects.find((p) => p.id === dispute.projectId);

              return (
                <Card
                  key={dispute.id}
                  className="overflow-hidden hover:shadow-glass-hover transition-all duration-300"
                >
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                              severity.wrapper
                            )}
                          >
                            <span className={cn('w-1.5 h-1.5 rounded-full', severity.dot)} />
                            {severity.label}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                            {getCategoryLabel(dispute.category)}
                          </span>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <h3 className="text-base font-bold text-slate-800 line-clamp-1 leading-snug">
                          {dispute.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {dispute.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <UserCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">
                          {dispute.submitterName}
                        </span>
                        <span className="text-slate-300">·</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(dispute.createdAt, 'relative')}</span>
                      </div>
                      {linkedExpense && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Receipt className="w-3.5 h-3.5 text-slate-400" />
                          <span>关联支出：</span>
                          <span className="font-medium text-slate-700 truncate max-w-[200px]">
                            {linkedExpense.title}
                          </span>
                        </div>
                      )}
                      {linkedProject && !linkedExpense && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FolderPlus className="w-3.5 h-3.5 text-slate-400" />
                          <span>关联项目：</span>
                          <span className="font-medium text-slate-700 truncate max-w-[200px]">
                            {linkedProject.title}
                          </span>
                        </div>
                      )}
                    </div>

                    {dispute.replies.length > 0 && (
                      <div className="mb-4 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                          最新回复 · {dispute.replies.length} 条对话
                        </div>
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          {dispute.replies[dispute.replies.length - 1].content}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4" />}
                        className="flex-1"
                        onClick={() => openReplyModal(dispute)}
                      >
                        查看详情
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<MessageSquare className="w-4 h-4" />}
                        onClick={() => openReplyModal(dispute)}
                      >
                        {dispute.replies.length === 0 ? '立即回复' : '继续沟通'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredDisputes.length === 0 && (
              <div className="col-span-full">
                <Card className="p-12">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mb-4">
                      <AlertOctagon className="w-8 h-8" />
                    </div>
                    <div className="text-base font-semibold text-slate-700">
                      {statusFilter === 'pending'
                        ? '太棒了！当前没有待处理的质疑'
                        : '暂无匹配的质疑记录'}
                    </div>
                    <div className="text-sm text-slate-500 mt-1.5">
                      {statusFilter === 'pending'
                        ? '保持公开透明，继续加油！'
                        : '试试调整搜索条件'}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </section>
        </div>
      </main>

      <Modal
        open={replyModalOpen}
        onClose={() => !submitting && setReplyModalOpen(false)}
        size="xl"
        title={
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-primary-500" />
            <span>质疑详情与回复</span>
          </div>
        }
        description={selectedDispute?.title}
        closeOnOverlayClick={!submitting}
      >
        {selectedDispute && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide pr-1">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/80">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                      getSeverityConfig(selectedDispute.severity).wrapper
                    )}
                  >
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        getSeverityConfig(selectedDispute.severity).dot
                      )}
                    />
                    {getSeverityConfig(selectedDispute.severity).label}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                    {getCategoryLabel(selectedDispute.category)}
                  </span>
                  <Badge variant={getStatusConfig(selectedDispute.status).variant}>
                    {getStatusConfig(selectedDispute.status).label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Hash className="w-3 h-3" />
                  {selectedDispute.id}
                </div>
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-800">
                      {selectedDispute.submitterName}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-600 font-medium">
                      捐赠人
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {formatDate(selectedDispute.createdAt, 'full')}
                  </div>
                </div>
              </div>

              <div className="pl-12">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedDispute.description}
                </p>
                {selectedDispute.evidenceUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {selectedDispute.evidenceUrls.map((url, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg overflow-hidden border border-slate-200"
                      >
                        <img src={url} alt={`证据 ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedDispute.replies.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  沟通记录 ({selectedDispute.replies.length})
                </div>
                {selectedDispute.replies.map((reply, index) => {
                  const isOrg = reply.authorRole === 'organizer';
                  return (
                    <div
                      key={reply.id}
                      className={cn(
                        'p-4 rounded-2xl border',
                        isOrg
                          ? 'bg-primary-50/40 border-primary-100 ml-8'
                          : 'bg-slate-50 border-slate-100 mr-8'
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-2.5 mb-2">
                        <div
                          className={cn(
                            'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold',
                            isOrg
                              ? 'bg-gradient-to-br from-primary-500 to-primary-600'
                              : 'bg-gradient-to-br from-slate-400 to-slate-500'
                          )}
                        >
                          {isOrg ? '机构' : reply.author.slice(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs font-semibold text-slate-800">
                              {reply.author}
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium',
                                isOrg
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'bg-slate-200 text-slate-600'
                              )}
                            >
                              {reply.authorRole === 'organizer'
                                ? '发起方'
                                : reply.authorRole === 'third_party'
                                ? '第三方审计'
                                : '捐赠人'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatDate(reply.createdAt, 'relative')}
                          </div>
                        </div>
                      </div>
                      <div className={cn('pl-10')}>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {reply.content}
                        </p>
                        {reply.attachments && reply.attachments.length > 0 && (
                          <div className="mt-3 grid grid-cols-4 gap-2">
                            {reply.attachments.map((url, i) => (
                              <div
                                key={i}
                                className="aspect-square rounded-lg overflow-hidden border border-slate-200"
                              >
                                <img
                                  src={url}
                                  alt={`附件 ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-primary-500" />
                机构回复
              </div>

              <div>
                <textarea
                  rows={4}
                  placeholder="请在此填写对质疑的详细回复，包括说明、证明材料、改进措施等。建议诚恳、具体、有依据..."
                  value={replyForm.content}
                  onChange={(e) =>
                    setReplyForm((prev) => ({ ...prev, content: e.target.value }))
                  }
                  className={cn(
                    inputClass('content'),
                    'h-auto py-3 resize-none leading-relaxed'
                  )}
                />
                <div className="flex items-center justify-between mt-1.5">
                  {formErrors.content ? (
                    <p className="text-xs text-danger-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.content}
                    </p>
                  ) : (
                    <div />
                  )}
                  <div className="text-[11px] text-slate-400">
                    {replyForm.content.length} 字
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={replyForm.hasCorrection}
                    onChange={(e) =>
                      setReplyForm((prev) => ({
                        ...prev,
                        hasCorrection: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    需要提交修正记录
                  </span>
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 text-slate-400 transition-transform',
                      replyForm.hasCorrection && 'rotate-90'
                    )}
                  />
                </label>
              </div>

              {replyForm.hasCorrection && (
                <div className="ml-6 pl-4 border-l-2 border-primary-200 space-y-4 animate-fade-in-up">
                  <div className="text-xs font-semibold text-primary-700 flex items-center gap-1.5">
                    <FileEdit className="w-3.5 h-3.5" />
                    修正记录详情
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      修正类型 <span className="text-danger-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {correctionTypeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleCorrectionTypeChange(opt.value)}
                          className={cn(
                            'p-3 rounded-xl border-2 text-left transition-all duration-200',
                            replyForm.correctionType === opt.value
                              ? 'border-primary-400 bg-primary-50/50'
                              : 'border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-slate-50'
                          )}
                        >
                          <div
                            className={cn(
                              'text-sm font-semibold',
                              replyForm.correctionType === opt.value
                                ? 'text-primary-700'
                                : 'text-slate-700'
                            )}
                          >
                            {opt.label}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {opt.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        修正字段 <span className="text-danger-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="如：支出金额、项目描述等"
                        value={replyForm.correctionField}
                        onChange={(e) =>
                          setReplyForm((prev) => ({
                            ...prev,
                            correctionField: e.target.value,
                          }))
                        }
                        className={inputClass('correctionField')}
                      />
                      {formErrors.correctionField && (
                        <p className="text-xs text-danger-600 mt-1">
                          {formErrors.correctionField}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          原值（修正前）
                        </label>
                        <textarea
                          rows={2}
                          placeholder="原始数据值，留空表示新增"
                          value={replyForm.correctionOldValue}
                          onChange={(e) =>
                            setReplyForm((prev) => ({
                              ...prev,
                              correctionOldValue: e.target.value,
                            }))
                          }
                          className={cn(
                            'w-full px-4 py-2.5 rounded-xl border-2 bg-slate-50/80',
                            'text-sm text-slate-700 placeholder:text-slate-400',
                            'border-slate-200 focus:outline-none resize-none'
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          新值（修正后） <span className="text-danger-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="请填写修正后的正确值"
                          value={replyForm.correctionNewValue}
                          onChange={(e) =>
                            setReplyForm((prev) => ({
                              ...prev,
                              correctionNewValue: e.target.value,
                            }))
                          }
                          className={cn(inputClass('correctionNewValue'), 'h-auto py-2.5 resize-none')}
                        />
                        {formErrors.correctionNewValue && (
                          <p className="text-xs text-danger-600 mt-1">
                            {formErrors.correctionNewValue}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        修正原因 <span className="text-danger-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="说明为什么需要修正，是填写失误、资料补充还是其他原因..."
                        value={replyForm.correctionReason}
                        onChange={(e) =>
                          setReplyForm((prev) => ({
                            ...prev,
                            correctionReason: e.target.value,
                          }))
                        }
                        className={cn(inputClass('correctionReason'), 'h-auto py-2.5 resize-none')}
                      />
                      {formErrors.correctionReason && (
                        <p className="text-xs text-danger-600 mt-1">
                          {formErrors.correctionReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <ModalFooter>
          <Button variant="ghost" onClick={() => setReplyModalOpen(false)} disabled={submitting}>
            关闭
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitReply}
            loading={submitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            提交回复
            {replyForm.hasCorrection && ' + 修正记录'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DisputeHandlePage;
