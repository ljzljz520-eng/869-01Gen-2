import type { Dispute } from '@/types';
import { PROJECT_ID } from './projects';

export const disputes: Dispute[] = [
  {
    id: 'dispute-001',
    projectId: PROJECT_ID,
    expenseId: 'exp-007',
    title: '关于项目管理费用8600元支出合理性的质疑',
    description:
      '本人关注本项目已久，看到最新一笔"项目办公耗材及人员成本"支出8600元，占目前已支出金额的比例偏高。根据项目介绍，管理费用应不超过总筹款的5%，目前已支出的管理费用似乎已超过该比例。请基金会详细说明：1. 2名项目人员的具体工时记录和工作内容；2. 办公耗材的具体明细清单；3. 该支出是否符合基金会关于项目管理费的相关规定。希望能提供相应的凭证和说明，保障每一分善款都用在刀刃上。',
    submitterName: '透明公益监督人',
    submitterEmail: 't***@charitywatch.org',
    status: 'resolved',
    severity: 'medium',
    category: 'expense_irregularity',
    evidenceUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=charity%20expense%20report%20transparency%20document%20checking&image_size=square',
    ],
    replies: [
      {
        id: 'reply-001',
        disputeId: 'dispute-001',
        author: '阳光公益基金会',
        authorRole: 'organizer',
        content:
          '感谢您对本项目的关注和监督！针对您提出的质疑，基金会高度重视，正在调取相关明细资料，将在3个工作日内给出详细说明和凭证。',
        createdAt: '2025-11-06T10:15:00.000Z',
      },
      {
        id: 'reply-002',
        disputeId: 'dispute-001',
        author: '阳光公益基金会',
        authorRole: 'organizer',
        content:
          '详细说明如下：1. 人员成本：项目主管王某（10月工作工时48小时，占比40%，分摊薪资5000元），项目助理李某（10月工作工时36小时，占比30%，分摊薪资2400元）。工作内容包括：物资供应商遴选与合同签订、志愿者招募与培训、与山区学校对接确认需求、社交媒体宣传推广等。2. 办公耗材明细：A4打印纸10箱（物资发放清单、签收表等打印）800元、墨盒3套240元、快递物流费（合同及资料寄送）160元，合计1200元。3. 费用合规性：根据基金会《项目管理办法》，项目管理费用不超过实际到账资金的10%。目前该笔支出占已筹资金38.7万元的比例约为2.2%，符合规定。详细凭证扫描件已上传附件。',
        attachments: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=timesheet%20work%20hours%20report%20document&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=office%20supplies%20receipts%20expense%20details&image_size=square',
        ],
        createdAt: '2025-11-08T14:30:00.000Z',
      },
      {
        id: 'reply-003',
        disputeId: 'dispute-001',
        author: '透明公益监督人',
        authorRole: 'donor',
        content:
          '感谢基金会的详细回复！看到工时记录和耗材明细后，对这笔支出的合理性有了更清晰的了解。建议后续可以在支出页面直接展示这些明细，而不是等质疑后再补充，这样可以减少不必要的疑虑，也更符合"透明公益"的理念。整体处理态度和响应速度值得肯定！',
        createdAt: '2025-11-09T09:45:00.000Z',
      },
      {
        id: 'reply-004',
        disputeId: 'dispute-001',
        author: '独立第三方审计机构',
        authorRole: 'third_party',
        content:
          '作为本项目的独立审计方，我们已核实该笔支出的相关凭证原件。结论：1. 工时记录与员工考勤系统数据一致；2. 办公耗材采购有对应发票和入库记录；3. 费用比例符合基金会管理规定。该支出真实合规，同意基金会的回复说明。',
        attachments: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=audit%20report%20stamp%20certified%20document&image_size=square',
        ],
        createdAt: '2025-11-10T08:30:00.000Z',
      },
    ],
    assignedTo: '基金会监审部张主任',
    resolution:
      '经核实，该笔支出真实合规。已与质疑人沟通并获得理解，同时基金会已优化支出页面展示信息，将在后续所有支出中直接附上更详细的明细说明，提升透明度。',
    createdAt: '2025-11-05T21:10:00.000Z',
    updatedAt: '2025-11-10T08:30:00.000Z',
    closedAt: '2025-11-10T17:00:00.000Z',
  },
];

export const getDisputesByProject = (projectId: string): Dispute[] => {
  return disputes.filter((d) => d.projectId === projectId);
};

export const getDisputeById = (id: string): Dispute | undefined => {
  return disputes.find((d) => d.id === id);
};

export const getDisputesByExpense = (expenseId: string): Dispute[] => {
  return disputes.filter((d) => d.expenseId === expenseId);
};

export const getOpenDisputes = (projectId: string): Dispute[] => {
  return disputes.filter((d) => d.projectId === projectId && d.status === 'open');
};

export const getResolvedDisputes = (projectId: string): Dispute[] => {
  return disputes.filter((d) => d.projectId === projectId && d.status === 'resolved');
};

export default disputes;
