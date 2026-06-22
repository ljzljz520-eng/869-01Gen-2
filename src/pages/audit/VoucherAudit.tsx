import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Receipt,
  ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  User,
  Phone,
  Hash,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Eye,
  CheckSquare,
  Square,
  Clock,
  Scale,
  FileText,
  Sparkles,
  RefreshCw,
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
import type { Expense } from '@/types';
import { formatAmount, formatAmountShort, formatDate } from '@/utils/formatter';
import { cn } from '@/lib/utils';

interface VoucherAuditProps {
  className?: string;
}

interface InvoiceCheckItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  required: boolean;
}

const VoucherAudit: React.FC<VoucherAuditProps> = ({ className }) => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const expenses = useDataStore((s) => s.expenses);
  const updateExpense = useDataStore((s) => s.updateExpense);

  const [activeNav, setActiveNav] = React.useState('vouchers');
  const [collapsed, setCollapsed] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>('pending');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = React.useState<number>(0);
  const [auditRemark, setAuditRemark] = React.useState('');
  const [processing, setProcessing] = React.useState<'approve' | 'reject' | null>(null);
  const [showRemarkInput, setShowRemarkInput] = React.useState(false);

  const [checkItems, setCheckItems] = React.useState<InvoiceCheckItem[]>([
    {
      id: 'invoice-number',
      label: '发票编号核验',
      description: '检查发票编号格式正确性及唯一性',
      checked: false,
      required: true,
    },
    {
      id: 'amount-match',
      label: '金额一致性',
      description: '发票金额与申报金额是否一致',
      checked: false,
      required: true,
    },
    {
      id: 'recipient-match',
      label: '收款方信息匹配',
      description: '发票抬头与收款方名称是否一致',
      checked: false,
      required: true,
    },
    {
      id: 'date-valid',
      label: '开票日期有效性',
      description: '开票日期是否在合理时间范围内',
      checked: false,
      required: true,
    },
    {
      id: 'seal-clear',
      label: '印章清晰度检查',
      description: '发票专用章是否清晰可辨',
      checked: false,
      required: true,
    },
    {
      id: 'photo-authentic',
      label: '照片真实性核验',
      description: '支出照片是否真实反映采购/发放情况',
      checked: false,
      required: false,
    },
    {
      id: 'category-reasonable',
      label: '支出类别合理性',
      description: '支出类别与项目范围是否匹配',
      checked: false,
      required: true,
    },
  ]);

  const pendingExpenses = expenses.filter((e) => e.status === 'pending');
  const approvedExpenses = expenses.filter((e) => e.status === 'approved');
  const rejectedExpenses = expenses.filter((e) => e.status === 'rejected');
  const disputedExpenses = expenses.filter((e) => e.status === 'disputed');

  const filteredExpenses = React.useMemo(() => {
    let list: Expense[] = [];
    switch (statusFilter) {
      case 'pending':
        list = pendingExpenses;
        break;
      case 'approved':
        list = approvedExpenses;
        break;
      case 'rejected':
        list = rejectedExpenses;
        break;
      case 'disputed':
        list = disputedExpenses;
        break;
      default:
        list = expenses;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.recipientName.toLowerCase().includes(q) ||
          (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(q))
      );
    }
    return list;
  }, [expenses, statusFilter, searchQuery, pendingExpenses, approvedExpenses, rejectedExpenses, disputedExpenses]);

  const selectedExpense = React.useMemo(
    () => expenses.find((e) => e.id === selectedId) ?? filteredExpenses[0] ?? null,
    [expenses, selectedId, filteredExpenses]
  );

  React.useEffect(() => {
    if (!selectedId && filteredExpenses.length > 0) {
      setSelectedId(filteredExpenses[0].id);
    }
  }, [selectedId, filteredExpenses]);

  React.useEffect(() => {
    setPreviewImageIndex(0);
    setAuditRemark('');
    setShowRemarkInput(false);
    setCheckItems((prev) => prev.map((item) => ({ ...item, checked: false })));
  }, [selectedExpense?.id]);

  const allRequiredChecked = checkItems
    .filter((i) => i.required)
    .every((i) => i.checked);

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
        badge: pendingExpenses.length > 0 ? pendingExpenses.length : undefined,
        badgeClass: 'bg-warning-500 text-white',
      },
      {
        value: 'disputes',
        label: '质疑仲裁',
        icon: <Scale className="w-5 h-5" />,
      },
    ],
    [pendingExpenses.length]
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

  const toggleCheckItem = (id: string) => {
    setCheckItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleApprove = async () => {
    if (!selectedExpense || !allRequiredChecked) return;
    setProcessing('approve');
    await new Promise((r) => setTimeout(r, 800));
    updateExpense(selectedExpense.id, {
      status: 'approved',
      approver: currentUser?.name,
      approverId: currentUser?.id,
      approvedAt: new Date().toISOString(),
      rejectionReason: auditRemark || undefined,
    });
    setProcessing(null);
    setSelectedId(null);
  };

  const handleReject = async () => {
    if (!selectedExpense || !showRemarkInput || !auditRemark.trim()) {
      if (!showRemarkInput) {
        setShowRemarkInput(true);
        return;
      }
      return;
    }
    setProcessing('reject');
    await new Promise((r) => setTimeout(r, 800));
    updateExpense(selectedExpense.id, {
      status: 'rejected',
      approver: currentUser?.name,
      approverId: currentUser?.id,
      approvedAt: new Date().toISOString(),
      rejectionReason: auditRemark,
    });
    setProcessing(null);
    setShowRemarkInput(false);
    setAuditRemark('');
    setSelectedId(null);
  };

  const getBadgeVariant = (
    status: Expense['status']
  ): 'approved' | 'pending' | 'rejected' | 'warning' => {
    switch (status) {
      case 'approved':
        return 'approved';
      case 'pending':
        return 'pending';
      case 'rejected':
        return 'rejected';
      case 'disputed':
        return 'warning';
      default:
        return 'pending';
    }
  };

  const getStatusLabel = (status: Expense['status']): string => {
    switch (status) {
      case 'approved':
        return '已通过';
      case 'pending':
        return '待审核';
      case 'rejected':
        return '已驳回';
      case 'disputed':
        return '有争议';
      default:
        return '';
    }
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
            <h1 className="text-lg font-bold text-slate-800">凭证审核</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              核验支出凭证真实性与合规性，守护每一分善款
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="pending">
              待审核 {pendingExpenses.length} 笔
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
                  placeholder="搜索支出标题、类别、收款方、发票号..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-secondary-400 focus:ring-4 focus:ring-secondary-100/50"
                />
              </div>
              <Tabs
                variant="pills"
                tabs={[
                  { value: 'pending', label: `待审核 (${pendingExpenses.length})` },
                  { value: 'approved', label: `已通过 (${approvedExpenses.length})` },
                  { value: 'rejected', label: `已驳回 (${rejectedExpenses.length})` },
                  { value: 'disputed', label: `争议 (${disputedExpenses.length})` },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                tabClassName="!px-3 !py-2 !text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-2.5">
              {filteredExpenses.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mb-4">
                    <Receipt className="w-7 h-7" />
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    暂无匹配的凭证
                  </div>
                  <div className="text-xs text-slate-500 mt-1.5">
                    调整筛选条件或稍后再来查看
                  </div>
                </div>
              ) : (
                filteredExpenses.map((expense) => {
                  const isActive = selectedExpense?.id === expense.id;
                  return (
                    <div
                      key={expense.id}
                      onClick={() => setSelectedId(expense.id)}
                      className={cn(
                        'group relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200',
                        isActive
                          ? 'border-secondary-400 bg-secondary-50/60 shadow-soft'
                          : 'border-transparent bg-white/60 hover:bg-white hover:border-slate-200 hover:shadow-sm'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                          {expense.voucherUrls[0] ? (
                            <img
                              src={expense.voucherUrls[0]}
                              alt={expense.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-slate-900">
                              {expense.title}
                            </div>
                            {isActive && (
                              <div className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-secondary-500 shadow-[0_0_0_3px_rgba(48,188,255,0.15)]" />
                            )}
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-medium text-slate-600">
                              {expense.category}
                            </span>
                            <Badge
                              variant={getBadgeVariant(expense.status)}
                              showIcon={false}
                              className="!px-2 !py-0.5 !text-[10px]"
                            >
                              {getStatusLabel(expense.status)}
                            </Badge>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-800 tabular-nums">
                              {formatAmountShort(expense.amount)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {expense.voucherUrls.length} 张凭证
                            </span>
                          </div>
                        </div>
                      </div>
                      {expense.status !== 'pending' && expense.approver && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            <ShieldCheck className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                            {expense.approver}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(expense.approvedAt ?? expense.updatedAt, 'short')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {selectedExpense ? (
              <>
                <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge variant={getBadgeVariant(selectedExpense.status)}>
                              {getStatusLabel(selectedExpense.status)}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              <Hash className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                              {selectedExpense.invoiceNumber || '无发票号'}
                            </span>
                          </div>
                          <CardTitle className="text-base">{selectedExpense.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {selectedExpense.category} · 提交于 {formatDate(selectedExpense.submittedAt, 'datetime')}
                          </CardDescription>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-slate-500 mb-0.5">申报金额</div>
                          <div className="text-2xl font-bold text-slate-800 tabular-nums">
                            {formatAmount(selectedExpense.amount)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        <div className="lg:col-span-3 space-y-3">
                          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-secondary-500" />
                            凭证预览 ({selectedExpense.voucherUrls.length})
                          </div>
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200/60 group">
                            <img
                              src={selectedExpense.voucherUrls[previewImageIndex]}
                              alt={`凭证 ${previewImageIndex + 1}`}
                              className="w-full h-full object-contain bg-slate-50"
                            />
                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                              {previewImageIndex + 1} / {selectedExpense.voucherUrls.length}
                            </div>
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                                <ZoomIn className="w-4 h-4" />
                              </button>
                            </div>
                            {selectedExpense.voucherUrls.length > 1 && (
                              <>
                                <button
                                  onClick={() =>
                                    setPreviewImageIndex((i) =>
                                      i === 0 ? selectedExpense.voucherUrls.length - 1 : i - 1
                                    )
                                  }
                                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm text-slate-700 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setPreviewImageIndex((i) =>
                                      i === selectedExpense.voucherUrls.length - 1 ? 0 : i + 1
                                    )
                                  }
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm text-slate-700 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                          {selectedExpense.voucherUrls.length > 1 && (
                            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                              {selectedExpense.voucherUrls.map((url, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setPreviewImageIndex(idx)}
                                  className={cn(
                                    'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                                    previewImageIndex === idx
                                      ? 'border-secondary-500 ring-2 ring-secondary-200'
                                      : 'border-slate-200 hover:border-slate-300'
                                  )}
                                >
                                  <img
                                    src={url}
                                    alt={`缩略图 ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div
                                    className={cn(
                                      'absolute inset-0 flex items-center justify-center text-[10px] font-bold transition-opacity',
                                      previewImageIndex === idx
                                        ? 'bg-secondary-500/80 text-white opacity-100'
                                        : 'bg-black/0 text-transparent hover:bg-black/30 hover:text-white'
                                    )}
                                  >
                                    {idx + 1}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                          <div className="space-y-2.5">
                            {[
                              { icon: <User className="w-3.5 h-3.5" />, label: '收款方', value: selectedExpense.recipientName },
                              {
                                icon: <Phone className="w-3.5 h-3.5" />,
                                label: '联系方式',
                                value: selectedExpense.recipientContact || '未提供',
                              },
                              {
                                icon: <Calendar className="w-3.5 h-3.5" />,
                                label: '提交日期',
                                value: formatDate(selectedExpense.submittedAt, 'date'),
                              },
                              {
                                icon: <ShieldCheck className="w-3.5 h-3.5" />,
                                label: '审核员',
                                value: selectedExpense.approver || '待审核',
                              },
                            ].map((row, i) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <div className="shrink-0 w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mt-0.5">
                                  {row.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[10px] text-slate-500">{row.label}</div>
                                  <div className="text-xs font-medium text-slate-800 break-words">
                                    {row.value}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                            <div className="text-[10px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              支出说明
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed line-clamp-5">
                              {selectedExpense.description}
                            </p>
                          </div>

                          {selectedExpense.rejectionReason && (
                            <div className="p-3.5 rounded-xl bg-danger-50 border border-danger-100">
                              <div className="text-[10px] font-semibold text-danger-700 mb-1.5 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                驳回原因
                              </div>
                              <p className="text-xs text-danger-800 leading-relaxed">
                                {selectedExpense.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Eye className="w-4 h-4 text-secondary-500" />
                            发票真伪与合规性检查
                          </CardTitle>
                          <CardDescription>
                            请逐项核验，必填项需全部通过方可审核
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">必填项进度</div>
                          <div className="text-sm font-bold text-slate-800">
                            {checkItems.filter((i) => i.required && i.checked).length} /{' '}
                            {checkItems.filter((i) => i.required).length}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {checkItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => selectedExpense?.status === 'pending' && toggleCheckItem(item.id)}
                            disabled={selectedExpense?.status !== 'pending'}
                            className={cn(
                              'group flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                              selectedExpense?.status === 'pending'
                                ? 'cursor-pointer hover:shadow-sm'
                                : 'cursor-not-allowed opacity-80',
                              item.checked
                                ? 'border-primary-300 bg-primary-50/60'
                                : 'border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white'
                            )}
                          >
                            <div
                              className={cn(
                                'shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-all',
                                item.checked
                                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm'
                                  : 'border-2 border-slate-300 group-hover:border-slate-400'
                              )}
                            >
                              {item.checked ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Square className="w-0 h-0" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'text-xs font-semibold',
                                    item.checked ? 'text-primary-700' : 'text-slate-800'
                                  )}
                                >
                                  {item.label}
                                </span>
                                {item.required ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-danger-100 text-[9px] font-bold text-danger-700">
                                    必填
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-medium text-slate-500">
                                    选填
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                {item.description}
                              </p>
                            </div>
                            <div
                              className={cn(
                                'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors',
                                item.checked
                                  ? 'text-primary-500'
                                  : 'text-slate-300'
                              )}
                            >
                              {item.checked && <CheckSquare className="w-4 h-4" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {showRemarkInput && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <MessageSquare className="w-4 h-4 text-danger-500" />
                          审核意见（驳回必填）
                        </CardTitle>
                        <CardDescription>
                          请详细说明驳回原因，便于机构修改完善
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <textarea
                          rows={4}
                          value={auditRemark}
                          onChange={(e) => setAuditRemark(e.target.value)}
                          placeholder="请详细描述驳回原因，包括：哪项检查未通过、具体问题、建议修改方向等..."
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-danger-400 focus:ring-4 focus:ring-danger-100/50 resize-none"
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {auditRemark.length} 字
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowRemarkInput(false);
                              setAuditRemark('');
                            }}
                            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                          >
                            取消
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="shrink-0 border-t border-slate-100/80 bg-white/70 backdrop-blur-sm px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      {selectedExpense.status === 'pending' && !allRequiredChecked && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warning-50 border border-warning-100 text-warning-700">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            请完成所有必填检查项
                          </span>
                        </div>
                      )}
                      {selectedExpense.status === 'pending' && allRequiredChecked && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-100 text-primary-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            检查项已完成，可审核
                          </span>
                        </div>
                      )}
                      {selectedExpense.status !== 'pending' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            该凭证已{getStatusLabel(selectedExpense.status)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      {selectedExpense.status === 'pending' && (
                        <>
                          <Button
                            variant={showRemarkInput ? 'danger' : 'outline'}
                            size="md"
                            leftIcon={<XCircle className="w-4 h-4" />}
                            onClick={handleReject}
                            loading={processing === 'reject'}
                            disabled={showRemarkInput && !auditRemark.trim()}
                          >
                            {showRemarkInput ? '确认驳回' : '驳回'}
                          </Button>
                          <Button
                            variant="primary"
                            size="md"
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                            onClick={handleApprove}
                            loading={processing === 'approve'}
                            disabled={!allRequiredChecked}
                          >
                            审核通过
                          </Button>
                        </>
                      )}
                      {selectedExpense.status !== 'pending' && (
                        <Button
                          variant="ghost"
                          size="md"
                          onClick={() => setSelectedId(null)}
                        >
                          关闭详情
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-sm">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary-50 to-primary-50 text-secondary-400 mb-5 shadow-soft">
                    <FileCheck2 className="w-10 h-10" />
                  </div>
                  <div className="text-lg font-bold text-slate-800 mb-1.5">
                    选择左侧凭证开始审核
                  </div>
                  <div className="text-sm text-slate-500 leading-relaxed mb-5">
                    点击左侧列表中的支出凭证，查看详细信息并完成核验流程
                  </div>
                  {pendingExpenses.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedId(pendingExpenses[0].id)}
                      leftIcon={<Sparkles className="w-4 h-4" />}
                    >
                      开始审核首笔 ({pendingExpenses.length})
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

export default VoucherAudit;
