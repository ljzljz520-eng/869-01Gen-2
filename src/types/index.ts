export interface Project {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  beneficiaryCount: number;
  beneficiary: string;
  organizer: string;
  startTime: string;
  endTime: string;
  status: 'ongoing' | 'completed' | 'suspended';
  location: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  projectId: string;
  donorName: string;
  donorAvatar?: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: 'wechat' | 'alipay' | 'bank' | 'other';
  status: 'success' | 'pending' | 'failed' | 'refunded';
  createdAt: string;
  confirmedAt?: string;
  orderId?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
}

export interface Expense {
  id: string;
  projectId: string;
  title: string;
  category: string;
  categoryId: string;
  amount: number;
  description: string;
  voucherUrls: string[];
  recipientName: string;
  recipientContact?: string;
  invoiceNumber?: string;
  status: 'approved' | 'pending' | 'rejected' | 'disputed';
  approver?: string;
  approverId?: string;
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeReply {
  id: string;
  disputeId: string;
  author: string;
  authorRole: 'donor' | 'organizer' | 'admin' | 'third_party';
  content: string;
  attachments?: string[];
  createdAt: string;
}

export type DisputeStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type DisputeSeverity = 'low' | 'medium' | 'high';

export interface Dispute {
  id: string;
  projectId: string;
  expenseId?: string;
  title: string;
  description: string;
  submitterName: string;
  submitterEmail?: string;
  status: DisputeStatus;
  severity: DisputeSeverity;
  category: 'expense_irregularity' | 'fund_misuse' | 'progress_false' | 'other';
  evidenceUrls: string[];
  replies: DisputeReply[];
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface CorrectionRecord {
  id: string;
  relatedId: string;
  relatedType: 'project' | 'expense' | 'progress' | 'dispute';
  fieldName: string;
  oldValue: string;
  newValue: string;
  reason: string;
  operator: string;
  operatorRole: string;
  createdAt: string;
}

export interface ProgressUpdate {
  id: string;
  projectId: string;
  title: string;
  content: string;
  images: string[];
  author: string;
  authorRole: string;
  isImportant: boolean;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}
