import type { Expense, ExpenseCategory } from '@/types';
import { PROJECT_ID } from './projects';

export const expenseCategories: ExpenseCategory[] = [
  { id: 'cat-winter-coat', name: '冬季外套采购', description: '儿童羽绒服、棉服等冬季外套购置' },
  { id: 'cat-warm-pants', name: '保暖裤袜采购', description: '加绒裤、保暖内衣、厚袜子等' },
  { id: 'cat-hat-scarf', name: '帽子围巾手套', description: '针织帽、围巾、保暖手套三件套' },
  { id: 'cat-shoes', name: '保暖鞋靴采购', description: '加绒棉鞋、雪地靴等' },
  { id: 'cat-transport', name: '物流运输费用', description: '物资仓储、分拣、运输至山区的物流成本' },
  { id: 'cat-volunteer', name: '志愿者执行费用', description: '志愿者交通、食宿、现场执行相关费用' },
  { id: 'cat-admin', name: '项目管理费用', description: '项目人员成本、办公耗材等行政管理费用' },
  { id: 'cat-other', name: '其他相关费用', description: '未列入以上类别的项目相关支出' },
];

export const expenses: Expense[] = [
  {
    id: 'exp-001',
    projectId: PROJECT_ID,
    title: '云南怒江州第一批儿童羽绒服采购',
    category: '冬季外套采购',
    categoryId: 'cat-winter-coat',
    amount: 96000,
    description:
      '为云南省怒江傈僳族自治州福贡县、贡山县共8所乡村小学的400名儿童采购加厚羽绒服，含连帽设计、防风防水面料，统一尺码120-160码。由昆明本地服饰供应商供货，签订采购合同并提供质检报告。',
    voucherUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=invoice%20document%20winter%20coat%20purchase%20contract%20chinese&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=winter%20jackets%20children%20clothing%20warehouse%20shipment&image_size=landscape_4_3',
    ],
    recipientName: '昆明暖冬服饰有限公司',
    recipientContact: '张经理 138****5678',
    invoiceNumber: 'INV-2025-KM-0087',
    status: 'approved',
    approver: '李主任',
    approverId: 'admin-li',
    submittedAt: '2025-10-10T09:00:00.000Z',
    approvedAt: '2025-10-12T14:30:00.000Z',
    createdAt: '2025-10-10T09:00:00.000Z',
    updatedAt: '2025-10-12T14:30:00.000Z',
  },
  {
    id: 'exp-002',
    projectId: PROJECT_ID,
    title: '贵州毕节市保暖内衣袜子采购',
    category: '保暖裤袜采购',
    categoryId: 'cat-warm-pants',
    amount: 42000,
    description:
      '为贵州省毕节市威宁、赫章两县12所小学的600名儿童采购加绒保暖内衣套装和厚棉袜（3双/人）。材质为纯棉加绒，符合国家A类儿童用品标准。',
    voucherUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=thermal%20underwear%20children%20clothing%20packing%20boxes&image_size=landscape_4_3',
    ],
    recipientName: '贵阳阳光针织厂',
    recipientContact: '王厂长 139****2345',
    invoiceNumber: 'INV-2025-GY-0156',
    status: 'approved',
    approver: '李主任',
    approverId: 'admin-li',
    submittedAt: '2025-10-18T11:20:00.000Z',
    approvedAt: '2025-10-20T10:00:00.000Z',
    createdAt: '2025-10-18T11:20:00.000Z',
    updatedAt: '2025-10-20T10:00:00.000Z',
  },
  {
    id: 'exp-003',
    projectId: PROJECT_ID,
    title: '帽子围巾手套三件套采购',
    category: '帽子围巾手套',
    categoryId: 'cat-hat-scarf',
    amount: 28800,
    description:
      '为全体受助儿童（1200人）采购帽子围巾手套三件套，含摇粒绒材质，多种可爱儿童款式，分男童女童款。',
    voucherUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hats%20scarves%20gloves%20children%20winter%20accessories%20colorful&image_size=landscape_4_3',
    ],
    recipientName: '义乌小商品批发中心',
    recipientContact: '陈老板 137****8899',
    invoiceNumber: 'INV-2025-YW-0342',
    status: 'approved',
    approver: '李主任',
    approverId: 'admin-li',
    submittedAt: '2025-10-25T08:45:00.000Z',
    approvedAt: '2025-10-26T16:00:00.000Z',
    createdAt: '2025-10-25T08:45:00.000Z',
    updatedAt: '2025-10-26T16:00:00.000Z',
  },
  {
    id: 'exp-004',
    projectId: PROJECT_ID,
    title: '儿童棉鞋雪地靴采购',
    category: '保暖鞋靴采购',
    categoryId: 'cat-shoes',
    amount: 54000,
    description:
      '为1200名儿童采购防滑防水加绒棉鞋，尺码28-36码，牛筋底防滑设计。部分高帮雪地靴用于高海拔地区学校。',
    voucherUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=children%20winter%20boots%20snow%20shoes%20colorful%20pairs&image_size=landscape_4_3',
    ],
    recipientName: '温州童鞋制造有限公司',
    recipientContact: '刘经理 136****1122',
    invoiceNumber: 'INV-2025-WZ-0098',
    status: 'approved',
    approver: '李主任',
    approverId: 'admin-li',
    submittedAt: '2025-11-01T13:30:00.000Z',
    approvedAt: '2025-11-03T09:15:00.000Z',
    createdAt: '2025-11-01T13:30:00.000Z',
    updatedAt: '2025-11-03T09:15:00.000Z',
  },
  {
    id: 'exp-005',
    projectId: PROJECT_ID,
    title: '昆明至怒江毕节物流运输费用',
    category: '物流运输费用',
    categoryId: 'cat-transport',
    amount: 18500,
    description:
      '包含：1. 昆明仓库至怒江州8所小学的物资运输（2辆货车，往返1600公里）；2. 贵阳仓至毕节市12所小学的运输（2辆货车，往返1200公里）；3. 物资仓储分拣费用和保险。',
    voucherUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=logistics%20truck%20mountain%20road%20transporting%20donation%20boxes&image_size=landscape_4_3',
    ],
    recipientName: '西南山区物流有限公司',
    recipientContact: '调度中心 0871-6****888',
    invoiceNumber: 'INV-2025-XN-0045',
    status: 'approved',
    approver: '李主任',
    approverId: 'admin-li',
    submittedAt: '2025-11-12T10:00:00.000Z',
    approvedAt: '2025-11-14T11:30:00.000Z',
    createdAt: '2025-11-12T10:00:00.000Z',
    updatedAt: '2025-11-14T11:30:00.000Z',
  },
  {
    id: 'exp-006',
    projectId: PROJECT_ID,
    title: '志愿者赴山区执行费用（第一批）',
    category: '志愿者执行费用',
    categoryId: 'cat-volunteer',
    amount: 12800,
    description:
      '第一批10名志愿者11月15日-11月20日赴怒江州发放物资。费用包含交通、住宿、餐饮、保险及现场物料。所有费用均有明细票据，志愿者补贴按标准执行。',
    voucherUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=volunteers%20delivering%20donations%20to%20mountain%20school%20children&image_size=landscape_4_3',
    ],
    recipientName: '项目志愿者团队',
    recipientContact: '队长赵某某 135****6677',
    invoiceNumber: 'EXP-2025-VOL-001',
    status: 'pending',
    submittedAt: '2025-11-25T17:00:00.000Z',
    createdAt: '2025-11-25T17:00:00.000Z',
    updatedAt: '2025-11-25T17:00:00.000Z',
  },
  {
    id: 'exp-007',
    projectId: PROJECT_ID,
    title: '项目办公耗材及人员成本',
    category: '项目管理费用',
    categoryId: 'cat-admin',
    amount: 8600,
    description:
      '项目执行团队2人10月份工资成本分摊（40%工时）、办公打印耗材、电话网络费用等。注意：该支出比例偏高，建议核实具体工时记录。',
    voucherUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=office%20supplies%20printing%20materials%20project%20management&image_size=square',
    ],
    recipientName: '基金会行政部',
    invoiceNumber: 'EXP-2025-ADM-023',
    status: 'disputed',
    approver: '待审核',
    submittedAt: '2025-11-05T15:20:00.000Z',
    createdAt: '2025-11-05T15:20:00.000Z',
    updatedAt: '2025-11-10T09:00:00.000Z',
  },
  {
    id: 'exp-008',
    projectId: PROJECT_ID,
    title: '第二批儿童保暖物资补充采购',
    category: '冬季外套采购',
    categoryId: 'cat-winter-coat',
    amount: 24500,
    description:
      '根据前期尺码统计数据，补购部分偏大偏小尺码的羽绒服200件，以及额外采购50件加厚羊毛衫用于极寒地区的高年级学生。',
    voucherUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=extra%20winter%20coats%20sweaters%20children%20clothing%20packing&image_size=landscape_4_3',
    ],
    recipientName: '昆明暖冬服饰有限公司',
    recipientContact: '张经理 138****5678',
    invoiceNumber: 'INV-2025-KM-0112',
    status: 'approved',
    approver: '李主任',
    approverId: 'admin-li',
    submittedAt: '2025-11-20T10:10:00.000Z',
    approvedAt: '2025-11-22T14:00:00.000Z',
    createdAt: '2025-11-20T10:10:00.000Z',
    updatedAt: '2025-11-22T14:00:00.000Z',
  },
];

export const getExpensesByProject = (projectId: string): Expense[] => {
  return expenses.filter((e) => e.projectId === projectId);
};

export const getExpenseById = (id: string): Expense | undefined => {
  return expenses.find((e) => e.id === id);
};

export const getApprovedExpenses = (projectId: string): Expense[] => {
  return expenses.filter((e) => e.projectId === projectId && e.status === 'approved');
};

export const getPendingExpenses = (projectId: string): Expense[] => {
  return expenses.filter((e) => e.projectId === projectId && e.status === 'pending');
};

export const getDisputedExpenses = (projectId: string): Expense[] => {
  return expenses.filter((e) => e.projectId === projectId && e.status === 'disputed');
};

export const calculateTotalExpenses = (projectId: string, includePending: boolean = false): number => {
  return expenses
    .filter(
      (e) =>
        e.projectId === projectId &&
        (e.status === 'approved' || (includePending && (e.status === 'pending' || e.status === 'disputed'))),
    )
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getExpenseCategoryById = (id: string): ExpenseCategory | undefined => {
  return expenseCategories.find((c) => c.id === id);
};

export default expenses;
