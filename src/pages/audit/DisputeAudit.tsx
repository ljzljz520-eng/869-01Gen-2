import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  Search,
  MessageSquareText,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Building2,
  UserCircle,
  ShieldCheck,
  FileWarning,
  Calendar,
  Hash,
  Tag,
  Paperclip,
  MessageSquareWarning,
  Sparkles,
  FileCheck2,
  Clock,
  AlertTriangle,
  CheckSquare,
  Square,
  History,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowRightLeft,
} from 'lucide-react';
import {
  AuditSidebar,
  type AuditNavItem,
} from '@/components/layout/AuditSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import type { Dispute, DisputeSeverity, DisputeStatus } from '@/types';
import { formatDate } from '@/utils/formatter';
import { cn } from '@/lib/utils';

interface DisputeAuditProps {
  className?: string;
}

interface AuditRecord {
  id: string;
  disputeId: string;
  action: 'review_start' | 'reply_approved' | 'reply_rejected' | 'correction_approved' | 'correction_rejected' | 'dispute_resolved' | 'dispute_closed';
  operator: string;
  operatorRole: string;
  timestamp: string;
  remark?: string;
}

const severityConfig: Record<DisputeSeverity, { label: string; wrapper: string; icon: React.ReactNode }> = {
  low: {
    label: '低',
    wrapper: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  medium: {
    label: '中',
    wrapper: 'bg-warning-50 text-warning-700 border-warning-200',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  high: {
    label: '高',
    wrapper: 'bg-danger-50 text-danger-700 border-danger-200',
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

const statusConfig: Record<DisputeStatus, { label: string; variant: 'pending' | 'approved' | 'rejected' | 'warning' }> = {
  open: { label: '待处理', variant: 'pending' },
  in_progress: { label: '处理中', variant: 'warning' },
  resolved: { label: '已解决', variant: 'approved' },
  closed: { label: '已关闭', variant: 'rejected' },
};

const categoryLabels: Record<string, string> = {
  expense_irregularity: '支出不规范',
  fund_misuse: '资金使用不当',
  progress_false: '进度虚假',
  other: '其他问题',
};

const DisputeAudit: React.FC<DisputeAuditProps> = ({ className }) => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const disputes = useDataStore((s) => s.disputes);
  const expenses = useDataStore((s) => s.expenses);
  const updateDispute = useDataStore((s) => s.updateDispute);
  const addDisputeReply = useDataStore((s) => s.addDisputeReply);

  const [activeNav, setActiveNav] = React.useState('disputes');
  const [collapsed, setCollapsed] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detailTab, setDetailTab] = React.useState<string>('replies');
  const [auditRemark, setAuditRemark] = React.useState('');
  const [processing, setProcessing] = React.useState<'approve' | 'reject' | null>(null);
  const [showRemarkInput, setShowRemarkInput] = React.useState(false);
  const [replyChecks, setReplyChecks] = React.useState<Record<string, boolean>>({});

  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'in_progress');
  const resolvedDisputes = disputes.filter((d) => d.status === 'resolved');

  const [auditRecords, setAuditRecords] = React.useState<AuditRecord[]>([
    {
      id: 'audit-001',
      disputeId: 'dispute-001',
      action: 'review_start',
      operator: '李华',
      operatorRole: '平台审核员',
      timestamp: '2025-11-05T22:00:00.000Z',
      remark: '质疑已受理，开始跟进核实',
    },
    {
      id: 'audit-002',
      disputeId: 'dispute-001',
      action: 'reply_approved',
      operator: '李华',
      operatorRole: '平台审核员',
      timestamp: '2025-11-06T10:30:00.000Z',
      remark: '机构初步回复已审核通过',
    },
    {
      id: 'audit-003',
      disputeId: 'dispute-001',
      action: 'reply_approved',
      operator: '李华',
      operatorRole: '平台审核员',
      timestamp: '2025-11-08T15:00:00.000Z',
      remark: '机构详细回复及凭证已审核通过，资料完整',
    },
  ]);

  const filteredDisputes = React.useMemo(() => {
    let list: Dispute[] = disputes;
    if (statusFilter !== 'all') {
      list = list.filter((d) => d.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.submitterName.toLowerCase().includes(q) ||
          (d.resolution && d.resolution.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [disputes, statusFilter, searchQuery]);

  const selectedDispute = React.useMemo(
    () => disputes.find((d) => d.id === selectedId) ?? filteredDisputes[0] ?? null,
    [disputes, selectedId, filteredDisputes]
  );

  const selectedExpense = React.useMemo(
    () => (selectedDispute?.expenseId ? expenses.find((e) => e.id === selectedDispute.expenseId) : null),
    [expenses, selectedDispute?.expenseId]
  );

  const orgReplies = React.useMemo(
    () => (selectedDispute?.replies ?? []).filter((r) => r.authorRole === 'organizer'),
    [selectedDispute?.replies]
  );

  const donorReplies = React.useMemo(
    () =>
      (selectedDispute?.replies ?? []).filter(
        (r) => r.authorRole === 'donor' || r.authorRole === 'third_party'
      ),
    [selectedDispute?.replies]
  );

  const relatedAuditRecords = React.useMemo(
    () => auditRecords.filter((r) => r.disputeId === selectedDispute?.id),
    [auditRecords, selectedDispute?.id]
  );

  const allOrgRepliesChecked = React.useMemo(() => {
    return orgReplies.length > 0 && orgReplies.every((r) => replyChecks[r.id]);
  }, [orgReplies, replyChecks]);

  React.useEffect(() => {
    if (!selectedId && filteredDisputes.length > 0) {
      setSelectedId(filteredDisputes[0].id);
    }
  }, [selectedId, filteredDisputes]);

  React.useEffect(() => {
    setDetailTab('replies');
    setAuditRemark('');
    setShowRemarkInput(false);
    setReplyChecks({});
  }, [selectedDispute?.id]);

  const customNavItems: AuditNavItem[] = React.useMemo(
    () => [
      {
        value: 'dashboard',
        label: '审核概览',
        icon: <Sparkles className="w-5 h-5" />,
      },
      {
        value: 'vouchers',
        label: '凭证审核',
        icon: <FileCheck2 className="w-5 h-5" />,
      },
      {
        value: 'disputes',
        label: '质疑仲裁',
        icon: <Scale className="w-5 h-5" />,
        badge: openDisputes.length > 0 ? openDisputes.length : undefined,
        badgeClass: 'bg-danger-500 text-white',
      },
    ],
    [openDisputes.length]
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

  const toggleReplyCheck = (replyId: string) => {
    setReplyChecks((prev) => ({ ...prev, [replyId]: !prev[replyId] }));
  };

  const addAuditRecord = (action: AuditRecord['action'], remark?: string) => {
    if (!selectedDispute) return;
    const newRecord: AuditRecord = {
      id: `audit-${Date.now()}`,
      disputeId: selectedDispute.id,
      action,
      operator: currentUser?.name ?? '系统',
      operatorRole: '平台审核员',
      timestamp: new Date().toISOString(),
      remark,
    };
    setAuditRecords((prev) => [newRecord, ...prev]);
  };

  const handleApproveResolution = async () => {
    if (!selectedDispute) return;
    setProcessing('approve');
    await new Promise((r) => setTimeout(r, 800));

    addDisputeReply(selectedDispute.id, {
      disputeId: selectedDispute.id,
      author: currentUser?.name ?? '平台审核员',
      authorRole: 'admin',
      content:
        auditRemark ||
        '经平台审核，机构回复真实可信，相关凭证齐全。质疑事项已得到妥善处理和说明，同意本次质疑处理结论。建议后续加强相关信息的主动公开透明度。',
    });

    updateDispute(selectedDispute.id, {
      status: 'resolved',
      assignedTo: currentUser?.name,
      resolution: selectedDispute.resolution || '平台审核通过机构处理方案',
      closedAt: new Date().toISOString(),
    });

    addAuditRecord('dispute_resolved', auditRemark || '平台审核通过，质疑已解决');
    setProcessing(null);
    setShowRemarkInput(false);
    setAuditRemark('');
  };

  const handleRejectResolution = async () => {
    if (!selectedDispute || (!showRemarkInput && !auditRemark.trim())) {
      if (!showRemarkInput) {
        setShowRemarkInput(true);
        return;
      }
      return;
    }
    setProcessing('reject');
    await new Promise((r) => setTimeout(r, 800));

    addDisputeReply(selectedDispute.id, {
      disputeId: selectedDispute.id,
      author: currentUser?.name ?? '平台审核员',
      authorRole: 'admin',
      content: `【平台审核意见-驳回】${auditRemark}\n\n请机构针对上述问题补充说明和凭证，或调整处理方案后重新提交。`,
    });

    updateDispute(selectedDispute.id, {
      status: 'in_progress',
      assignedTo: currentUser?.name,
    });

    addAuditRecord('reply_rejected', auditRemark);
    setProcessing(null);
  };

  const getActionLabel = (action: AuditRecord['action']): string => {
    const labels: Record<AuditRecord['action'], string> = {
      review_start: '开始审核',
      reply_approved: '回复通过',
      reply_rejected: '回复驳回',
      correction_approved: '修正通过',
      correction_rejected: '修正驳回',
      dispute_resolved: '质疑解决',
      dispute_closed: '质疑关闭',
    };
    return labels[action];
  };

  const getActionColor = (action: AuditRecord['action']): string => {
    if (action === 'reply_rejected' || action === 'correction_rejected' || action === 'dispute_closed') {
      return 'bg-danger-100 text-danger-700';
    }
    if (action === 'dispute_resolved' || action === 'reply_approved' || action === 'correction_approved') {
      return 'bg-primary-100 text-primary-700';
    }
    return 'bg-secondary-100 text-secondary-700';
  };

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
            <h1 className="text-lg font-bold text-slate-800">质疑仲裁</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              审核机构回复与修正方案，公正调解争议问题
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="rejected" showIcon={false}>
              待处理 {openDisputes.length} 条
            </Badge>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <aside className="w-[420px] shrink-0 border-r border-slate-100/80 bg-white/40 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100/80 space-y-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索质疑标题、描述、提交人..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-danger-400 focus:ring-4 focus:ring-danger-100/50"
                />
              </div>
              <Tabs
                variant="pills"
                tabs={[
                  { value: 'all', label: `全部 (${disputes.length})` },
                  { value: 'open', label: `待处理 (${openDisputes.length})` },
                  { value: 'in_progress', label: `处理中 (${disputes.filter((d) => d.status === 'in_progress').length})` },
                  { value: 'resolved', label: `已解决 (${resolvedDisputes.length})` },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                tabClassName="!px-3 !py-2 !text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-2.5">
              {filteredDisputes.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mb-4">
                    <MessageSquareWarning className="w-7 h-7" />
                  </div>
                  <div className="text-sm font-semibold text-slate-700">暂无质疑记录</div>
                  <div className="text-xs text-slate-500 mt-1.5">筛选条件下无匹配结果</div>
                </div>
              ) : (
                filteredDisputes.map((dispute) => {
                  const isActive = selectedDispute?.id === dispute.id;
                  const sevConf = severityConfig[dispute.severity];
                  return (
                    <div
                      key={dispute.id}
                      onClick={() => setSelectedId(dispute.id)}
                      className={cn(
                        'group relative p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200',
                        isActive
                          ? 'border-danger-400 bg-danger-50/40 shadow-soft'
                          : 'border-transparent bg-white/60 hover:bg-white hover:border-slate-200 hover:shadow-sm'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                            dispute.status === 'open'
                              ? 'bg-danger-100 text-danger-600'
                              : dispute.status === 'in_progress'
                              ? 'bg-warning-100 text-warning-600'
                              : 'bg-primary-100 text-primary-600'
                          )}
                        >
                          {dispute.status === 'resolved' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <MessageSquareWarning className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-slate-900">
                              {dispute.title}
                            </div>
                            {isActive && (
                              <div className="shrink-0 w-2 h-2 mt-1 rounded-full bg-danger-500 shadow-[0_0_0_3px_rgba(248,113,116,0.15)]" />
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant={statusConfig[dispute.status].variant}
                              showIcon={false}
                              className="!px-2 !py-0.5 !text-[10px]"
                            >
                              {statusConfig[dispute.status].label}
                            </Badge>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-bold',
                                sevConf.wrapper
                              )}
                            >
                              {sevConf.icon}
                              {sevConf.label}风险
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600">
                              {categoryLabels[dispute.category] || dispute.category}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 truncate">
                              <UserCircle className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                              {dispute.submitterName}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatDate(dispute.createdAt, 'relative')}
                            </span>
                          </div>
                        </div>
                      </div>
                      {dispute.replies.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            <MessageSquareText className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                            {dispute.replies.length} 条回复
                          </span>
                          {selectedExpense && (
                            <span className="text-[10px] text-slate-500">
                              <Hash className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                              关联支出
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {selectedDispute ? (
              <>
                <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">
                  <Card className="overflow-hidden border-slate-100">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant={statusConfig[selectedDispute.status].variant}>
                              {statusConfig[selectedDispute.status].label}
                            </Badge>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-bold',
                                severityConfig[selectedDispute.severity].wrapper
                              )}
                            >
                              {severityConfig[selectedDispute.severity].icon}
                              {severityConfig[selectedDispute.severity].label}风险
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
                              <Tag className="w-3 h-3" />
                              {categoryLabels[selectedDispute.category] || selectedDispute.category}
                            </span>
                          </div>
                          <CardTitle className="text-base leading-snug">{selectedDispute.title}</CardTitle>
                          <CardDescription className="mt-1.5 flex flex-wrap items-center gap-4 text-xs">
                            <span className="inline-flex items-center gap-1.5">
                              <UserCircle className="w-3.5 h-3.5" />
                              {selectedDispute.submitterName}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(selectedDispute.createdAt, 'datetime')}
                            </span>
                            {selectedDispute.assignedTo && (
                              <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                跟进：{selectedDispute.assignedTo}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50/80 to-white/50 border border-slate-100">
                        <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                          <MessageSquareWarning className="w-3.5 h-3.5 text-danger-500" />
                          质疑详情
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {selectedDispute.description}
                        </p>
                        {selectedDispute.evidenceUrls.length > 0 && (
                          <div className="mt-3.5 pt-3.5 border-t border-slate-100/80">
                            <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                              <Paperclip className="w-3.5 h-3.5" />
                              提交人证据 ({selectedDispute.evidenceUrls.length})
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                              {selectedDispute.evidenceUrls.map((url, idx) => (
                                <div
                                  key={idx}
                                  className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer hover:shadow-md transition-shadow group"
                                >
                                  <img
                                    src={url}
                                    alt={`证据 ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedExpense && (
                        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-warning-50/50 to-white border border-warning-100/60">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 w-9 h-9 rounded-xl bg-warning-100 flex items-center justify-center text-warning-600 mt-0.5">
                              <FileWarning className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-semibold text-warning-700 mb-1 flex items-center gap-1.5">
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                关联支出记录
                              </div>
                              <div className="text-sm font-semibold text-slate-800 truncate">
                                {selectedExpense.title}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                                <span className="text-slate-600">
                                  金额：
                                  <span className="font-bold text-slate-800">
                                    ¥{selectedExpense.amount.toLocaleString()}
                                  </span>
                                </span>
                                <span className="text-slate-500">
                                  类别：{selectedExpense.category}
                                </span>
                                <Badge
                                  variant={
                                    selectedExpense.status === 'approved'
                                      ? 'approved'
                                      : selectedExpense.status === 'pending'
                                      ? 'pending'
                                      : selectedExpense.status === 'rejected'
                                      ? 'rejected'
                                      : 'warning'
                                  }
                                  showIcon={false}
                                  className="!px-2 !py-0.5 !text-[10px]"
                                >
                                  {selectedExpense.status === 'approved'
                                    ? '已通过'
                                    : selectedExpense.status === 'pending'
                                    ? '待审核'
                                    : selectedExpense.status === 'rejected'
                                    ? '已驳回'
                                    : '有争议'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="!pb-3">
                      <Tabs
                        tabs={[
                          {
                            value: 'replies',
                            label: (
                              <span className="flex items-center gap-1.5">
                                <MessageSquareText className="w-4 h-4" />
                                机构回复 ({orgReplies.length})
                              </span>
                            ),
                          },
                          {
                            value: 'corrections',
                            label: (
                              <span className="flex items-center gap-1.5">
                                <Edit3 className="w-4 h-4" />
                                修正记录
                              </span>
                            ),
                          },
                          {
                            value: 'history',
                            label: (
                              <span className="flex items-center gap-1.5">
                                <History className="w-4 h-4" />
                                审核追溯 ({relatedAuditRecords.length})
                              </span>
                            ),
                          },
                        ]}
                        value={detailTab}
                        onChange={setDetailTab}
                      />
                    </CardHeader>
                    <CardContent className="!pt-1">
                      {detailTab === 'replies' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-primary-500" />
                              机构官方回复
                              {orgReplies.length > 0 && (
                                <span className="ml-1 text-slate-400 font-normal">
                                  （请勾选审核通过的回复）
                                </span>
                              )}
                            </div>
                            {orgReplies.length > 0 && (
                              <div className="text-xs">
                                <span
                                  className={cn(
                                    'font-semibold',
                                    allOrgRepliesChecked ? 'text-primary-600' : 'text-slate-500'
                                  )}
                                >
                                  {Object.values(replyChecks).filter(Boolean).length} / {orgReplies.length}
                                </span>
                                <span className="text-slate-400"> 已审核</span>
                              </div>
                            )}
                          </div>

                          {orgReplies.length === 0 ? (
                            <div className="py-8 text-center rounded-xl bg-slate-50/50 border border-dashed border-slate-200">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mb-3">
                                <Clock className="w-6 h-6" />
                              </div>
                              <div className="text-sm font-semibold text-slate-700">等待机构回复</div>
                              <div className="text-xs text-slate-500 mt-1">机构尚未对该质疑作出回应</div>
                            </div>
                          ) : (
                            <div className="space-y-3.5">
                              {orgReplies.map((reply, idx) => (
                                <div
                                  key={reply.id}
                                  className={cn(
                                    'relative p-4 rounded-2xl border-2 transition-all',
                                    replyChecks[reply.id]
                                      ? 'border-primary-300 bg-primary-50/40'
                                      : 'border-slate-200 bg-white/60 hover:border-slate-300'
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <button
                                      onClick={() => toggleReplyCheck(reply.id)}
                                      disabled={selectedDispute.status === 'resolved' || selectedDispute.status === 'closed'}
                                      className={cn(
                                        'shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed',
                                        replyChecks[reply.id]
                                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm'
                                          : 'border-2 border-slate-300 hover:border-slate-400'
                                      )}
                                    >
                                      {replyChecks[reply.id] ? (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      ) : (
                                        <Square className="w-0 h-0" />
                                      )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                            <Building2 className="w-3.5 h-3.5" />
                                          </div>
                                          <div>
                                            <div className="text-xs font-bold text-slate-800">
                                              {reply.author}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                              机构官方 · 第 {idx + 1} 次回复
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {replyChecks[reply.id] && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold">
                                              <CheckSquare className="w-3 h-3" />
                                              已审核通过
                                            </span>
                                          )}
                                          <span className="text-[10px] text-slate-400">
                                            {formatDate(reply.createdAt, 'datetime')}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="pl-0.5">
                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                          {reply.content}
                                        </p>
                                        {reply.attachments && reply.attachments.length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-slate-100/80">
                                            <div className="text-[10px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                                              <Paperclip className="w-3 h-3" />
                                              附件凭证 ({reply.attachments.length})
                                            </div>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                              {reply.attachments.map((url, i) => (
                                                <div
                                                  key={i}
                                                  className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer hover:shadow-md transition-shadow group"
                                                >
                                                  <img
                                                    src={url}
                                                    alt={`附件 ${i + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                  />
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {donorReplies.length > 0 && (
                            <div className="mt-6 pt-5 border-t border-slate-100">
                              <div className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                                <UserCircle className="w-4 h-4 text-secondary-500" />
                                其他方回应与评论 ({donorReplies.length})
                              </div>
                              <div className="space-y-3">
                                {donorReplies.map((reply) => (
                                  <div
                                    key={reply.id}
                                    className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100"
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <div
                                        className={cn(
                                          'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm',
                                          reply.authorRole === 'third_party'
                                            ? 'bg-gradient-to-br from-secondary-400 to-secondary-500'
                                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                        )}
                                      >
                                        {reply.authorRole === 'third_party' ? (
                                          <ShieldCheck className="w-3.5 h-3.5" />
                                        ) : (
                                          <UserCircle className="w-3.5 h-3.5" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                          <span className="text-xs font-bold text-slate-800">
                                            {reply.author}
                                            <span className="ml-1.5 font-normal text-slate-500">
                                              （
                                              {reply.authorRole === 'third_party'
                                                ? '独立第三方审计'
                                                : '质疑人'}
                                              ）
                                            </span>
                                          </span>
                                          <span className="text-[10px] text-slate-400">
                                            {formatDate(reply.createdAt, 'datetime')}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                          {reply.content}
                                        </p>
                                        {reply.attachments && reply.attachments.length > 0 && (
                                          <div className="mt-2.5 flex gap-1.5 flex-wrap">
                                            {reply.attachments.map((url, i) => (
                                              <div
                                                key={i}
                                                className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white cursor-pointer hover:shadow-sm transition-shadow"
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
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedDispute.resolution && (
                            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary-50/80 to-secondary-50/50 border-2 border-primary-200/50">
                              <div className="flex items-start gap-3">
                                <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-soft mt-0.5">
                                  <CheckCircle2 className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-bold text-primary-700 mb-1 flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5" />
                                    处理结论
                                  </div>
                                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                                    {selectedDispute.resolution}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {detailTab === 'corrections' && (
                        <div className="space-y-4">
                          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <Edit3 className="w-4 h-4 text-secondary-500" />
                            机构数据修正与信息补充记录
                          </div>
                          <div className="space-y-3.5">
                            {selectedDispute.status === 'open' ||
                            (selectedDispute.status === 'in_progress' && orgReplies.length <= 1) ? (
                              <div className="py-8 text-center rounded-xl bg-slate-50/50 border border-dashed border-slate-200">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mb-3">
                                  <Edit3 className="w-6 h-6" />
                                </div>
                                <div className="text-sm font-semibold text-slate-700">暂无修正记录</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  机构可能在回复中直接补充说明，未做数据修改
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="p-4 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50/50 to-white">
                                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-600">
                                        <Edit3 className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="text-xs font-bold text-slate-800">
                                          支出页面信息补充优化
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                          <Building2 className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                                          阳光公益基金会 ·{' '}
                                          {formatDate('2025-11-08T14:30:00.000Z', 'datetime')}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge variant="approved" showIcon={false} className="!px-2 !py-0.5 !text-[10px]">
                                      已生效
                                    </Badge>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-[80px_1fr_20px_1fr] gap-2 items-start">
                                      <div className="text-[11px] text-slate-500 pt-2 shrink-0">字段</div>
                                      <div className="p-2.5 rounded-xl bg-danger-50 border border-danger-100">
                                        <div className="text-[10px] text-danger-500 mb-0.5">修正前</div>
                                        <div className="text-xs text-slate-700 line-through decoration-danger-400/60">
                                          仅显示支出金额与基本说明
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-center pt-2 text-slate-400">
                                        <ChevronRight className="w-4 h-4" />
                                      </div>
                                      <div className="p-2.5 rounded-xl bg-primary-50 border border-primary-100">
                                        <div className="text-[10px] text-primary-600 mb-0.5">修正后</div>
                                        <div className="text-xs text-slate-700 font-medium">
                                          补充人员工时分摊明细、办公耗材清单、费用比例说明
                                        </div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-[80px_1fr] gap-2 items-start pt-2 border-t border-slate-100/80">
                                      <div className="text-[11px] text-slate-500 pt-2 shrink-0">修正原因</div>
                                      <div className="text-xs text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed">
                                        根据质疑人反馈，基金会已优化所有支出页面的信息展示方式，后续所有支出将直接附上更详细的明细说明，减少不必要的疑虑，提升透明度。
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {detailTab === 'history' && (
                        <div className="space-y-4">
                          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <History className="w-4 h-4 text-secondary-500" />
                            平台审核操作全记录
                            <span className="ml-1 text-slate-400 font-normal">
                              （所有审核操作可追溯、可审计）
                            </span>
                          </div>
                          {relatedAuditRecords.length === 0 ? (
                            <div className="py-8 text-center rounded-xl bg-slate-50/50 border border-dashed border-slate-200">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mb-3">
                                <History className="w-6 h-6" />
                              </div>
                              <div className="text-sm font-semibold text-slate-700">暂无审核记录</div>
                            </div>
                          ) : (
                            <div className="relative pl-6">
                              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-secondary-200 via-primary-200 to-slate-200 rounded-full" />
                              <div className="space-y-4">
                                {relatedAuditRecords
                                  .slice()
                                  .sort(
                                    (a, b) =>
                                      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                                  )
                                  .map((record, idx) => (
                                    <div key={record.id} className="relative">
                                      <div
                                        className={cn(
                                          'absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md z-10',
                                          getActionColor(record.action)
                                        )}
                                      >
                                        {idx === 0 ? (
                                          <Eye className="w-3 h-3" />
                                        ) : record.action.includes('approved') ||
                                          record.action === 'dispute_resolved' ? (
                                          <ThumbsUp className="w-3 h-3" />
                                        ) : record.action.includes('rejected') ? (
                                          <ThumbsDown className="w-3 h-3" />
                                        ) : (
                                          <Clock className="w-3 h-3" />
                                        )}
                                      </div>
                                      <div className="p-3.5 rounded-xl border border-slate-100 bg-white/70 hover:bg-white transition-colors">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={cn(
                                                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                                                getActionColor(record.action)
                                              )}
                                            >
                                              {getActionLabel(record.action)}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-800">
                                              {record.operator}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                              （{record.operatorRole}）
                                            </span>
                                          </div>
                                          <span className="text-[10px] text-slate-400">
                                            {formatDate(record.timestamp, 'datetime')}
                                          </span>
                                        </div>
                                        {record.remark && (
                                          <p className="text-xs text-slate-700 leading-relaxed pl-1 mt-1.5 pt-1.5 border-t border-slate-100/60">
                                            {record.remark}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {showRemarkInput && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FileWarning className="w-4 h-4 text-danger-500" />
                          审核意见
                        </CardTitle>
                        <CardDescription>
                          请详细说明审核结论和依据，将作为官方审核意见公示
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <textarea
                          rows={4}
                          value={auditRemark}
                          onChange={(e) => setAuditRemark(e.target.value)}
                          placeholder="请详细说明审核意见：包括对机构回复的核实情况、证据凭证的核验结论、是否认可处理方案、后续改进建议等..."
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-secondary-400 focus:ring-4 focus:ring-secondary-100/50 resize-none"
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="shrink-0 border-t border-slate-100/80 bg-white/70 backdrop-blur-sm px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      {selectedDispute.status === 'open' || selectedDispute.status === 'in_progress' ? (
                        orgReplies.length === 0 ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">等待机构回复</span>
                          </div>
                        ) : !allOrgRepliesChecked ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warning-50 border border-warning-100 text-warning-700">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              请勾选审核通过的机构回复
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-100 text-primary-700">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              回复已核验，可进行仲裁
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            该质疑已{statusConfig[selectedDispute.status].label}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      {(selectedDispute.status === 'open' ||
                        selectedDispute.status === 'in_progress') && (
                        <>
                          <Button
                            variant={showRemarkInput ? 'danger' : 'outline'}
                            size="md"
                            leftIcon={<XCircle className="w-4 h-4" />}
                            onClick={handleRejectResolution}
                            loading={processing === 'reject'}
                            disabled={showRemarkInput && !auditRemark.trim()}
                          >
                            {showRemarkInput ? '确认驳回方案' : '要求补充修正'}
                          </Button>
                          <Button
                            variant="primary"
                            size="md"
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                            onClick={handleApproveResolution}
                            loading={processing === 'approve'}
                            disabled={!allOrgRepliesChecked}
                          >
                            通过处理方案
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-sm">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-danger-50 to-warning-50 text-danger-400 mb-5 shadow-soft">
                    <Scale className="w-10 h-10" />
                  </div>
                  <div className="text-lg font-bold text-slate-800 mb-1.5">选择左侧质疑开始仲裁</div>
                  <div className="text-sm text-slate-500 leading-relaxed mb-5">
                    点击列表中的质疑记录，审核机构回复内容，给出公正的仲裁意见
                  </div>
                  {openDisputes.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedId(openDisputes[0].id)}
                      leftIcon={<Sparkles className="w-4 h-4" />}
                    >
                      处理首条质疑 ({openDisputes.length})
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DisputeAudit;
