import { useMemo, useState } from 'react';
import {
  FileText,
  Camera,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Send,
  User as UserIcon,
  Calendar,
  Building2,
  Receipt,
  CheckCircle2,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DisputeTimeline } from '@/components/timeline/DisputeTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useDataStore } from '@/store/dataStore';
import { formatAmount, formatDate } from '@/utils/formatter';
import type { Expense, Dispute, DisputeSeverity, DisputeReply } from '@/types';

interface ExpenseDetailModalProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export default function ExpenseDetailModal({ open, onClose, expense }: ExpenseDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeTitle, setDisputeTitle] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeSeverity, setDisputeSeverity] = useState<DisputeSeverity>('medium');
  const [submitting, setSubmitting] = useState(false);

  const getDisputesByExpense = useDataStore((state) => state.getDisputesByExpense);
  const addDispute = useDataStore((state) => state.addDispute);

  const disputes = useMemo(
    () => (expense ? getDisputesByExpense(expense.id) : []),
    [expense, getDisputesByExpense]
  );

  const disputeMessages = useMemo(() => {
    const messages: (DisputeReply | {
      id: string;
      disputeId: string;
      author: string;
      authorRole: 'donor' | 'organizer' | 'admin' | 'third_party';
      content: string;
      attachments: { name: string; icon: React.ReactNode }[];
      createdAt: string;
    })[] = [];
    disputes.forEach((d: Dispute) => {
      messages.push({
        id: `submit-${d.id}`,
        disputeId: d.id,
        author: d.submitterName,
        authorRole: 'donor' as const,
        content: `【${d.title}】\n${d.description}`,
        attachments: d.evidenceUrls.map((_, i) => ({
          name: `证据${i + 1}`,
          icon: <Paperclip className="w-3 h-3" />,
        })),
        createdAt: d.createdAt,
      });
      d.replies.forEach((r) => messages.push(r));
    });
    return messages.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [disputes]);

  const handleSubmitDispute = () => {
    if (!expense || !disputeTitle.trim() || !disputeDescription.trim()) return;
    setSubmitting(true);

    setTimeout(() => {
      addDispute({
        projectId: expense.projectId,
        expenseId: expense.id,
        title: disputeTitle.trim(),
        description: disputeDescription.trim(),
        submitterName: '匿名爱心人士',
        status: 'open',
        severity: disputeSeverity,
        category: 'expense_irregularity',
        evidenceUrls: [],
      });
      setDisputeTitle('');
      setDisputeDescription('');
      setDisputeSeverity('medium');
      setShowDisputeForm(false);
      setSubmitting(false);
    }, 800);
  };

  if (!expense) return null;

  const allImages = expense.voucherUrls;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={expense.title}
      description={expense.category}
      size="xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-primary-600" />
              支出凭证
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-soft">
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[activeImageIndex]}
                    alt={`凭证 ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {expense.status === 'approved' && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute -inset-4 opacity-20">
                          <CheckCircle2 className="w-40 h-40 text-primary-600 rotate-[-15deg]" strokeWidth={2.5} />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-600/90 text-white px-6 py-2.5 rounded-full font-bold text-sm rotate-[-15deg] shadow-lg border-2 border-white/50 backdrop-blur-sm">
                          已审核盖章
                        </div>
                      </div>
                    </div>
                  )}
                  {expense.status === 'disputed' && (
                    <div className="absolute top-4 right-4 bg-danger-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      存在质疑
                    </div>
                  )}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIndex((v) => (v - 1 + allImages.length) % allImages.length)
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setActiveImageIndex((v) => (v + 1) % allImages.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImageIndex(i)}
                            className={cn(
                              'w-2 h-2 rounded-full transition-all',
                              i === activeImageIndex ? 'bg-white w-5' : 'bg-white/60'
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Camera className="w-12 h-12 mb-2" />
                  <p className="text-sm">暂无凭证照片</p>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={cn(
                      'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                      i === activeImageIndex
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-transparent hover:border-slate-200'
                    )}
                  >
                    <img src={img} alt={`缩略图 ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-secondary-600" />
                支出基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100">
                <span className="text-slate-500 shrink-0">支出金额</span>
                <span className="text-lg font-bold text-slate-800">
                  {formatAmount(expense.amount)}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100">
                <span className="text-slate-500 shrink-0">支出类别</span>
                <span className="text-slate-700 text-right">{expense.category}</span>
              </div>
              <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100">
                <span className="text-slate-500 shrink-0 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  收款方
                </span>
                <span className="text-slate-700 text-right">{expense.recipientName}</span>
              </div>
              {expense.recipientContact && (
                <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100">
                  <span className="text-slate-500 shrink-0">联系方式</span>
                  <span className="text-slate-700 text-right">{expense.recipientContact}</span>
                </div>
              )}
              {expense.invoiceNumber && (
                <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100">
                  <span className="text-slate-500 shrink-0 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    发票编号
                  </span>
                  <span className="text-slate-700 font-mono text-xs">
                    {expense.invoiceNumber}
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100">
                <span className="text-slate-500 shrink-0">审核状态</span>
                <Badge
                  variant={
                    expense.status === 'approved'
                      ? 'approved'
                      : expense.status === 'pending'
                      ? 'pending'
                      : expense.status === 'rejected'
                      ? 'rejected'
                      : 'warning'
                  }
                >
                  {expense.status === 'approved' && '已审核通过'}
                  {expense.status === 'pending' && '待审核'}
                  {expense.status === 'rejected' && '已驳回'}
                  {expense.status === 'disputed' && '存在质疑'}
                </Badge>
              </div>
              {expense.approver && (
                <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100">
                  <span className="text-slate-500 shrink-0">审核人</span>
                  <span className="text-slate-700">{expense.approver}</span>
                </div>
              )}
              <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100">
                <span className="text-slate-500 shrink-0 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  提交时间
                </span>
                <span className="text-slate-700 text-xs">
                  {formatDate(expense.submittedAt, 'full')}
                </span>
              </div>
              {expense.approvedAt && (
                <div className="flex items-start justify-between gap-4 py-2">
                  <span className="text-slate-500 shrink-0 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    审核时间
                  </span>
                  <span className="text-slate-700 text-xs">
                    {formatDate(expense.approvedAt, 'full')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">支出说明</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 leading-relaxed">{expense.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-warning-600" />
              质疑与解释记录
              {disputes.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-danger-100 text-danger-700 text-xs font-bold">
                  {disputes.length}
                </span>
              )}
            </CardTitle>
            {!showDisputeForm && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDisputeForm(true)}
                leftIcon={<AlertTriangle className="w-4 h-4" />}
              >
                发起质疑
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {showDisputeForm && (
              <Card className="bg-warning-50/50 border-warning-200">
                <CardContent className="pt-5 space-y-4">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-warning-600" />
                    发起质疑
                  </h4>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">质疑标题</label>
                    <input
                      type="text"
                      value={disputeTitle}
                      onChange={(e) => setDisputeTitle(e.target.value)}
                      placeholder="请简要描述您的疑问"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">严重程度</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as DisputeSeverity[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setDisputeSeverity(s)}
                          className={cn(
                            'px-4 py-2 rounded-xl text-xs font-medium transition-all border',
                            disputeSeverity === s
                              ? s === 'low'
                                ? 'bg-primary-50 text-primary-700 border-primary-300'
                                : s === 'medium'
                                ? 'bg-warning-50 text-warning-700 border-warning-300'
                                : 'bg-danger-50 text-danger-700 border-danger-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          )}
                        >
                          {s === 'low' && '轻微'}
                          {s === 'medium' && '中等'}
                          {s === 'high' && '严重'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">详细说明</label>
                    <textarea
                      value={disputeDescription}
                      onChange={(e) => setDisputeDescription(e.target.value)}
                      placeholder="请详细说明您的疑问，我们会认真核查每一笔支出..."
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowDisputeForm(false);
                        setDisputeTitle('');
                        setDisputeDescription('');
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      loading={submitting}
                      onClick={handleSubmitDispute}
                      disabled={!disputeTitle.trim() || !disputeDescription.trim()}
                      leftIcon={<Send className="w-4 h-4" />}
                    >
                      提交质疑
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {disputeMessages.length > 0 ? (
              <DisputeTimeline
                messages={disputeMessages.map((msg) => ({
                  id: msg.id,
                  role:
                    msg.authorRole === 'organizer'
                      ? 'auditor'
                      : msg.authorRole === 'admin'
                      ? 'auditor'
                      : msg.authorRole === 'third_party'
                      ? 'auditor'
                      : 'user',
                  name: msg.author,
                  content: msg.content,
                  time: formatDate(msg.createdAt, 'short'),
                  attachments: msg.attachments?.map((att) => ({
                    name: att.name,
                    icon: att.icon ?? <Paperclip className="w-3 h-3" />,
                  })),
                }))}
              />
            ) : (
              !showDisputeForm && (
                <div className="py-8 text-center text-slate-400">
                  <UserIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">暂无质疑记录，所有支出公开透明可追溯</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}
