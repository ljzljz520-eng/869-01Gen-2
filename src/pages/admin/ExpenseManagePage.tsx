import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Search,
  Plus,
  Eye,
  Edit3,
  FileText,
  ImageIcon,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  ClipboardList,
  FileWarning,
  User,
  Phone,
  Hash,
  FolderPlus,
} from 'lucide-react';
import {
  AdminSidebar,
  type SidebarNavItem,
} from '@/components/layout/AdminSidebar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Tabs, TabContent } from '@/components/ui/Tabs';
import { useAuthStore } from '@/store/authStore';
import type { Expense } from '@/types';
import { expenses as initialExpenses, expenseCategories } from '@/data/expenses';
import { projects } from '@/data/projects';
import { formatAmount, formatAmountShort, formatDate } from '@/utils/formatter';
import { cn } from '@/lib/utils';

type WizardStep = 1 | 2 | 3;

interface UploadedFile {
  id: string;
  name: string;
  type: 'invoice' | 'photo';
  url: string;
  size?: string;
}

const ExpenseManagePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const [activeNav, setActiveNav] = React.useState('expenses');
  const [collapsed, setCollapsed] = React.useState(false);
  const [expenseList, setExpenseList] = React.useState<Expense[]>(initialExpenses);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [wizardStep, setWizardStep] = React.useState<WizardStep>(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null);

  const [wizardData, setWizardData] = React.useState<{
    projectId: string;
    categoryId: string;
    title: string;
    description: string;
    amount: number;
    recipientName: string;
    recipientContact: string;
    invoiceNumber: string;
    invoiceFiles: UploadedFile[];
    photoFiles: UploadedFile[];
  }>({
    projectId: projects[0]?.id ?? '',
    categoryId: '',
    title: '',
    description: '',
    amount: 0,
    recipientName: '',
    recipientContact: '',
    invoiceNumber: '',
    invoiceFiles: [],
    photoFiles: [],
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
      { value: 'disputes', label: '质疑处理', icon: <ClipboardList className="w-5 h-5" /> },
    ],
    []
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

  const filteredExpenses = React.useMemo(() => {
    return expenseList.filter((e) => {
      const matchSearch =
        !searchQuery ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.recipientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [expenseList, searchQuery, statusFilter]);

  const totalApproved = expenseList
    .filter((e) => e.status === 'approved')
    .reduce((s, e) => s + e.amount, 0);
  const totalPending = expenseList
    .filter((e) => e.status === 'pending')
    .reduce((s, e) => s + e.amount, 0);
  const pendingCount = expenseList.filter((e) => e.status === 'pending').length;
  const rejectedCount = expenseList.filter((e) => e.status === 'rejected').length;
  const disputedCount = expenseList.filter((e) => e.status === 'disputed').length;

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

  const openWizard = () => {
    setWizardData({
      projectId: projects[0]?.id ?? '',
      categoryId: '',
      title: '',
      description: '',
      amount: 0,
      recipientName: '',
      recipientContact: '',
      invoiceNumber: '',
      invoiceFiles: [],
      photoFiles: [],
    });
    setFormErrors({});
    setWizardStep(1);
    setWizardOpen(true);
  };

  const openDetail = (expense: Expense) => {
    setSelectedExpense(expense);
    setDetailOpen(true);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'invoice' | 'photo'
  ) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map((f, i) => ({
      id: `${type}-${Date.now()}-${i}`,
      name: f.name,
      type,
      url: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${
        type === 'invoice' ? 'invoice%20receipt%20document' : 'charity%20expense%20photo%20evidence'
      }&image_size=square`,
      size: `${(f.size / 1024).toFixed(1)} KB`,
    }));

    setWizardData((prev) => ({
      ...prev,
      [type === 'invoice' ? 'invoiceFiles' : 'photoFiles']: [
        ...(type === 'invoice' ? prev.invoiceFiles : prev.photoFiles),
        ...newFiles,
      ],
    }));
  };

  const removeFile = (fileId: string, type: 'invoice' | 'photo') => {
    setWizardData((prev) => ({
      ...prev,
      [type === 'invoice' ? 'invoiceFiles' : 'photoFiles']: (
        type === 'invoice' ? prev.invoiceFiles : prev.photoFiles
      ).filter((f) => f.id !== fileId),
    }));
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!wizardData.projectId) errors.projectId = '请选择关联项目';
    if (!wizardData.categoryId) errors.categoryId = '请选择支出类别';
    if (!wizardData.title.trim()) errors.title = '请输入支出标题';
    if (!wizardData.description.trim()) errors.description = '请输入支出说明';
    if (wizardData.amount <= 0) errors.amount = '支出金额必须大于0';
    if (!wizardData.recipientName.trim()) errors.recipientName = '请输入收款方名称';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (wizardData.invoiceFiles.length === 0 && wizardData.photoFiles.length === 0) {
      errors.vouchers = '请至少上传一种凭证（发票或照片）';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (wizardStep === 1 && !validateStep1()) return;
    if (wizardStep === 2 && !validateStep2()) return;
    if (wizardStep < 3) setWizardStep((wizardStep + 1) as WizardStep);
  };

  const prevStep = () => {
    if (wizardStep > 1) setWizardStep((wizardStep - 1) as WizardStep);
  };

  const handleSubmitWizard = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const category = expenseCategories.find((c) => c.id === wizardData.categoryId);
    const now = new Date().toISOString();

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      projectId: wizardData.projectId,
      title: wizardData.title,
      category: category?.name ?? '',
      categoryId: wizardData.categoryId,
      amount: wizardData.amount,
      description: wizardData.description,
      voucherUrls: [
        ...wizardData.invoiceFiles.map((f) => f.url),
        ...wizardData.photoFiles.map((f) => f.url),
      ],
      recipientName: wizardData.recipientName,
      recipientContact: wizardData.recipientContact || undefined,
      invoiceNumber: wizardData.invoiceNumber || undefined,
      status: 'pending',
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    setExpenseList((prev) => [newExpense, ...prev]);
    setSubmitting(false);
    setWizardOpen(false);
  };

  const inputClass = (field: string) =>
    cn(
      'w-full h-11 px-4 rounded-xl border-2 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400',
      'transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50',
      formErrors[field]
        ? 'border-danger-300 focus:border-danger-400 focus:ring-danger-100/50'
        : 'border-slate-200'
    );

  const stepIndicator = (step: number, label: string, icon: React.ReactNode) => {
    const isActive = wizardStep === step;
    const isDone = wizardStep > step;
    return (
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
            isActive
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-soft scale-105'
              : isDone
              ? 'bg-primary-100 text-primary-600 border-2 border-primary-200'
              : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
          )}
        >
          {isDone ? <Check className="w-4 h-4" /> : icon}
        </div>
        <div className="hidden sm:block">
          <div
            className={cn(
              'text-xs font-semibold tracking-tight',
              isActive ? 'text-primary-600' : isDone ? 'text-slate-600' : 'text-slate-400'
            )}
          >
            步骤 {step}
          </div>
          <div
            className={cn(
              'text-sm font-bold',
              isActive ? 'text-slate-800' : isDone ? 'text-slate-700' : 'text-slate-400'
            )}
          >
            {label}
          </div>
        </div>
      </div>
    );
  };

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
            <h1 className="text-lg font-bold text-slate-800">支出管理</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              记录项目支出、上传凭证、跟进审核进度
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openWizard}
          >
            录入支出
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500">累计支出</div>
                  <div className="mt-1.5 text-xl font-bold text-slate-800 tabular-nums">
                    {formatAmountShort(totalApproved)}
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
                  <div className="text-xs font-medium text-slate-500">待审核</div>
                  <div className="mt-1.5 text-xl font-bold text-slate-800 tabular-nums">
                    {pendingCount} 笔
                    <span className="text-xs text-warning-600 ml-1 font-medium">
                      {formatAmountShort(totalPending)}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-warning-100 text-warning-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500">已驳回</div>
                  <div className="mt-1.5 text-xl font-bold text-slate-800 tabular-nums">
                    {rejectedCount} 笔
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-danger-100 text-danger-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500">存在争议</div>
                  <div className="mt-1.5 text-xl font-bold text-slate-800 tabular-nums">
                    {disputedCount} 笔
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-secondary-100 text-secondary-600 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
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
                  placeholder="搜索支出标题、类别或收款方..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50"
                />
              </div>
              <Tabs
                variant="pills"
                tabs={[
                  { value: 'all', label: `全部 (${expenseList.length})` },
                  { value: 'pending', label: `待审核 (${pendingCount})` },
                  { value: 'approved', label: `已通过 (${expenseList.filter((e) => e.status === 'approved').length})` },
                  { value: 'rejected', label: `已驳回 (${rejectedCount})` },
                  { value: 'disputed', label: `有争议 (${disputedCount})` },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full lg:w-auto"
              />
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      支出信息
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      类别
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      金额
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      收款方
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      提交时间
                    </th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600">
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-800 line-clamp-1 max-w-[280px]">
                              {expense.title}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500 line-clamp-1 max-w-[280px]">
                              {expense.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="text-base font-bold text-slate-800 tabular-nums">
                          {formatAmount(expense.amount)}
                        </div>
                        {expense.invoiceNumber && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            #{expense.invoiceNumber.slice(-6)}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700 font-medium">
                          {expense.recipientName}
                        </div>
                        {expense.recipientContact && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {expense.recipientContact}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {formatDate(expense.submittedAt, 'date')}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {formatDate(expense.submittedAt, 'relative')}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Badge variant={getBadgeVariant(expense.status)}>
                          {getStatusLabel(expense.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-4 h-4" />}
                            onClick={() => openDetail(expense)}
                          >
                            详情
                          </Button>
                          {expense.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Edit3 className="w-4 h-4" />}
                            >
                              编辑
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredExpenses.length === 0 && (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mb-4">
                  <Receipt className="w-8 h-8" />
                </div>
                <div className="text-base font-semibold text-slate-700">
                  暂无匹配的支出记录
                </div>
                <div className="text-sm text-slate-500 mt-1.5">
                  调整搜索条件或录入一笔新支出
                </div>
                <Button
                  className="mt-5"
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={openWizard}
                >
                  录入支出
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Modal
        open={wizardOpen}
        onClose={() => !submitting && setWizardOpen(false)}
        size="xl"
        title={
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {stepIndicator(1, '填写信息', <FileText className="w-4 h-4" />)}
            <div className="hidden sm:block flex-1 min-w-[32px] h-0.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={cn(
                  'h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500',
                  wizardStep >= 2 ? 'w-full' : 'w-0'
                )}
              />
            </div>
            {stepIndicator(2, '上传凭证', <ImageIcon className="w-4 h-4" />)}
            <div className="hidden sm:block flex-1 min-w-[32px] h-0.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={cn(
                  'h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500',
                  wizardStep >= 3 ? 'w-full' : 'w-0'
                )}
              />
            </div>
            {stepIndicator(3, '确认提交', <CheckCircle2 className="w-4 h-4" />)}
          </div>
        }
        closeOnOverlayClick={!submitting}
        showCloseButton={!submitting}
      >
        <div className="mt-2">
          <TabContent value="1" activeValue={String(wizardStep)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    关联项目 <span className="text-danger-500">*</span>
                  </label>
                  <select
                    value={wizardData.projectId}
                    onChange={(e) =>
                      setWizardData((prev) => ({ ...prev, projectId: e.target.value }))
                    }
                    className={inputClass('projectId')}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  {formErrors.projectId && (
                    <p className="text-xs text-danger-600">{formErrors.projectId}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    支出类别 <span className="text-danger-500">*</span>
                  </label>
                  <select
                    value={wizardData.categoryId}
                    onChange={(e) =>
                      setWizardData((prev) => ({ ...prev, categoryId: e.target.value }))
                    }
                    className={inputClass('categoryId')}
                  >
                    <option value="">请选择支出类别</option>
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && (
                    <p className="text-xs text-danger-600">{formErrors.categoryId}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  支出标题 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="简明描述这笔支出，如：XX小学物资采购"
                  value={wizardData.title}
                  onChange={(e) =>
                    setWizardData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className={inputClass('title')}
                />
                {formErrors.title && (
                  <p className="text-xs text-danger-600">{formErrors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    支出金额 <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                      ¥
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={wizardData.amount || ''}
                      onChange={(e) =>
                        setWizardData((prev) => ({
                          ...prev,
                          amount: Number(e.target.value) || 0,
                        }))
                      }
                      className={cn(inputClass('amount'), 'pl-8')}
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="text-xs text-danger-600">{formErrors.amount}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    <Hash className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    发票编号
                  </label>
                  <input
                    type="text"
                    placeholder="如有请填写，便于对账"
                    value={wizardData.invoiceNumber}
                    onChange={(e) =>
                      setWizardData((prev) => ({
                        ...prev,
                        invoiceNumber: e.target.value,
                      }))
                    }
                    className={inputClass('')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    <User className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    收款方名称 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="供应商/收款单位名称"
                    value={wizardData.recipientName}
                    onChange={(e) =>
                      setWizardData((prev) => ({
                        ...prev,
                        recipientName: e.target.value,
                      }))
                    }
                    className={inputClass('recipientName')}
                  />
                  {formErrors.recipientName && (
                    <p className="text-xs text-danger-600">{formErrors.recipientName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    <Phone className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    联系方式
                  </label>
                  <input
                    type="text"
                    placeholder="联系人及电话"
                    value={wizardData.recipientContact}
                    onChange={(e) =>
                      setWizardData((prev) => ({
                        ...prev,
                        recipientContact: e.target.value,
                      }))
                    }
                    className={inputClass('')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  支出说明 <span className="text-danger-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="详细描述支出的用途、背景、受益人等..."
                  value={wizardData.description}
                  onChange={(e) =>
                    setWizardData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className={cn(inputClass('description'), 'h-auto py-3 resize-none')}
                />
                {formErrors.description && (
                  <p className="text-xs text-danger-600">{formErrors.description}</p>
                )}
              </div>
            </div>
          </TabContent>

          <TabContent value="2" activeValue={String(wizardStep)}>
            <div className="space-y-5">
              <div className="p-3 rounded-xl bg-warning-50/70 border border-warning-100 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-warning-600 mt-0.5 shrink-0" />
                <div className="text-xs text-warning-700 leading-relaxed">
                  请上传真实有效的支出凭证。至少需要一种凭证：
                  <strong>发票</strong>（采购合同、收据、发票等）或
                  <strong>照片</strong>（物资照片、发放现场、签收记录等）。
                  凭证越完整，审核越快速。
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary-500" />
                    发票 / 收据 / 合同
                  </label>
                  <span className="text-xs text-slate-400">
                    已上传 {wizardData.invoiceFiles.length} 份
                  </span>
                </div>
                <label className="block">
                  <div className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-primary-300 transition-all cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <div className="text-sm font-medium text-slate-600">
                      点击上传发票/收据/合同
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      支持 PDF、JPG、PNG，单个文件不超过 10MB
                    </div>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'invoice')}
                  />
                </label>
                {wizardData.invoiceFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {wizardData.invoiceFiles.map((f) => (
                      <div
                        key={f.id}
                        className="relative rounded-xl overflow-hidden border border-slate-200 bg-white group"
                      >
                        <div className="aspect-square bg-slate-50">
                          <img
                            src={f.url}
                            alt={f.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 border-t border-slate-100">
                          <div className="text-[11px] font-medium text-slate-700 truncate">
                            {f.name}
                          </div>
                          {f.size && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{f.size}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(f.id, 'invoice')}
                          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-secondary-500" />
                    支出照片 / 现场记录
                  </label>
                  <span className="text-xs text-slate-400">
                    已上传 {wizardData.photoFiles.length} 张
                  </span>
                </div>
                <label className="block">
                  <div className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-secondary-300 transition-all cursor-pointer">
                    <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                    <div className="text-sm font-medium text-slate-600">
                      上传支出相关照片
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      物资照片、发放现场、签收表等，支持多张
                    </div>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'photo')}
                  />
                </label>
                {wizardData.photoFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {wizardData.photoFiles.map((f) => (
                      <div
                        key={f.id}
                        className="relative rounded-xl overflow-hidden border border-slate-200 bg-white group"
                      >
                        <div className="aspect-square">
                          <img
                            src={f.url}
                            alt={f.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(f.id, 'photo')}
                          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formErrors.vouchers && (
                <p className="text-xs text-danger-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.vouchers}
                </p>
              )}
            </div>
          </TabContent>

          <TabContent value="3" activeValue={String(wizardStep)}>
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary-800">
                      请确认以下信息无误
                    </div>
                    <div className="text-xs text-primary-600/80 mt-1 leading-relaxed">
                      提交后支出将进入审核流程，审核通过后将自动公示。请确保金额和凭证真实准确。
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                {[
                  { label: '关联项目', value: projects.find((p) => p.id === wizardData.projectId)?.title ?? '-' },
                  {
                    label: '支出类别',
                    value: expenseCategories.find((c) => c.id === wizardData.categoryId)?.name ?? '-',
                  },
                  { label: '支出标题', value: wizardData.title },
                  {
                    label: '支出金额',
                    value: (
                      <span className="text-base font-bold text-primary-600 tabular-nums">
                        {formatAmount(wizardData.amount)}
                      </span>
                    ),
                  },
                  { label: '收款方', value: `${wizardData.recipientName}${wizardData.recipientContact ? ` · ${wizardData.recipientContact}` : ''}` },
                  { label: '发票编号', value: wizardData.invoiceNumber || '未提供' },
                  {
                    label: '支出说明',
                    value: <p className="whitespace-pre-wrap leading-relaxed">{wizardData.description}</p>,
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex gap-4 py-2.5 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="shrink-0 w-24 text-xs font-medium text-slate-500 pt-0.5">
                      {row.label}
                    </div>
                    <div className="flex-1 min-w-0 text-sm text-slate-800 font-medium break-words">
                      {row.value}
                    </div>
                  </div>
                ))}

                <div className="flex gap-4 py-2.5">
                  <div className="shrink-0 w-24 text-xs font-medium text-slate-500 pt-0.5">
                    上传凭证
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium border border-primary-100">
                        <FileText className="w-3 h-3" />
                        发票 {wizardData.invoiceFiles.length} 份
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary-50 text-secondary-700 text-xs font-medium border border-secondary-100">
                        <ImageIcon className="w-3 h-3" />
                        照片 {wizardData.photoFiles.length} 张
                      </span>
                    </div>
                    {(wizardData.invoiceFiles.length > 0 || wizardData.photoFiles.length > 0) && (
                      <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {[...wizardData.invoiceFiles, ...wizardData.photoFiles]
                          .slice(0, 6)
                          .map((f) => (
                            <div
                              key={f.id}
                              className="aspect-square rounded-lg overflow-hidden border border-slate-200"
                            >
                              <img
                                src={f.url}
                                alt={f.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        {wizardData.invoiceFiles.length + wizardData.photoFiles.length > 6 && (
                          <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                            +{wizardData.invoiceFiles.length + wizardData.photoFiles.length - 6}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabContent>
        </div>

        <ModalFooter>
          {wizardStep > 1 ? (
            <Button
              variant="ghost"
              onClick={prevStep}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              disabled={submitting}
            >
              上一步
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setWizardOpen(false)} disabled={submitting}>
              取消
            </Button>
          )}
          {wizardStep < 3 ? (
            <Button
              variant="primary"
              onClick={nextStep}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              下一步
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmitWizard}
              loading={submitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              提交审核
            </Button>
          )}
        </ModalFooter>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        size="lg"
        title={selectedExpense?.title ?? '支出详情'}
        description={`${selectedExpense?.category} · ${selectedExpense ? formatAmount(selectedExpense.amount) : ''}`}
      >
        {selectedExpense && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <div>
                <div className="text-xs text-slate-500 mb-1">审核状态</div>
                <Badge variant={getBadgeVariant(selectedExpense.status)}>
                  {getStatusLabel(selectedExpense.status)}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1">提交时间</div>
                <div className="text-sm font-semibold text-slate-700">
                  {formatDate(selectedExpense.submittedAt, 'datetime')}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: '关联项目', value: projects.find((p) => p.id === selectedExpense.projectId)?.title ?? '-' },
                { label: '收款方', value: selectedExpense.recipientName },
                { label: '联系方式', value: selectedExpense.recipientContact || '未提供' },
                { label: '发票编号', value: selectedExpense.invoiceNumber || '未提供' },
                { label: '审核员', value: selectedExpense.approver || '待指派' },
                { label: '通过时间', value: selectedExpense.approvedAt ? formatDate(selectedExpense.approvedAt, 'datetime') : '未审核' },
              ].map((row, i) => (
                <div key={i} className="flex gap-4 py-2 border-b border-slate-100 last:border-b-0">
                  <div className="shrink-0 w-20 text-xs font-medium text-slate-500 pt-0.5">
                    {row.label}
                  </div>
                  <div className="flex-1 min-w-0 text-sm text-slate-800 font-medium break-words">
                    {row.value}
                  </div>
                </div>
              ))}

              <div className="flex gap-4 py-2">
                <div className="shrink-0 w-20 text-xs font-medium text-slate-500 pt-0.5">
                  支出说明
                </div>
                <div className="flex-1 min-w-0 p-3 rounded-xl bg-slate-50 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedExpense.description}
                </div>
              </div>
            </div>

            {selectedExpense.rejectionReason && (
              <div className="p-4 rounded-xl bg-danger-50 border border-danger-100">
                <div className="flex items-start gap-2.5">
                  <FileWarning className="w-4 h-4 text-danger-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-danger-700 mb-1">
                      驳回原因
                    </div>
                    <div className="text-sm text-danger-800 leading-relaxed">
                      {selectedExpense.rejectionReason}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                支出凭证 ({selectedExpense.voucherUrls.length})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedExpense.voucherUrls.map((url, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer hover:shadow-md transition-shadow group"
                  >
                    <img
                      src={url}
                      alt={`凭证 ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <ModalFooter>
          {selectedExpense?.status === 'rejected' && (
            <Button variant="warning" leftIcon={<Edit3 className="w-4 h-4" />}>
              修改后重新提交
            </Button>
          )}
          <Button variant="outline" onClick={() => setDetailOpen(false)}>
            关闭
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ExpenseManagePage;
