import type { ProgressUpdate } from '@/types';
import { PROJECT_ID } from './projects';

export const progressUpdates: ProgressUpdate[] = [
  {
    id: 'progress-001',
    projectId: PROJECT_ID,
    title: '项目正式启动，完成山区学校需求调研',
    content:
      '经过两个月的前期准备和实地调研，"山区儿童温暖冬衣计划"于9月1日正式启动。项目团队先后走访了云南省怒江傈僳族自治州福贡县、贡山县，以及贵州省毕节市威宁县、赫章县共8个县32所乡村小学，对1200余名儿童的身高体重、保暖需求、家庭情况进行了详细登记。调研结果显示：87%的孩子没有合适的冬季羽绒服，65%的孩子仅有一双单鞋过冬。我们将根据实际尺码数据，有针对性地采购保暖物资，确保每一件冬衣都合身、实用。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=volunteers%20surveying%20mountain%20village%20school%20children%20china%20countryside&image_size=landscape_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20village%20elementary%20school%20building%20rural%20china&image_size=landscape_4_3',
    ],
    author: '阳光公益基金会',
    authorRole: '项目执行方',
    isImportant: true,
    likes: 356,
    comments: 42,
    createdAt: '2025-09-10T09:00:00.000Z',
    updatedAt: '2025-09-10T09:00:00.000Z',
  },
  {
    id: 'progress-002',
    projectId: PROJECT_ID,
    title: '第一批羽绒服完成采购，质量抽检合格',
    content:
      '经过公开招标和多轮比价，我们与昆明暖冬服饰有限公司签订了第一批400件儿童羽绒服的采购合同。羽绒服采用防风防水面料、90%白鸭绒填充，符合国家GB/T 14272-2021《羽绒服装》标准。到货后，项目组联合第三方质检机构进行了抽样检测，检测结果全部合格。质检报告已上传至项目文件，欢迎捐赠人查阅监督。预计10月25日前完成所有物资的采购工作。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=children%20winter%20jackets%20quality%20inspection%20factory&image_size=landscape_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=down%20jackets%20stacked%20in%20warehouse%20ready%20shipment&image_size=landscape_4_3',
    ],
    author: '阳光公益基金会',
    authorRole: '项目执行方',
    isImportant: true,
    likes: 289,
    comments: 35,
    createdAt: '2025-10-15T11:30:00.000Z',
    updatedAt: '2025-10-15T11:30:00.000Z',
  },
  {
    id: 'progress-003',
    projectId: PROJECT_ID,
    title: '怒江州第一批物资发放完成，孩子们露出灿烂笑容',
    content:
      '11月18日，项目第一批志愿者团队满载冬衣物资，历经12小时盘山公路颠簸，抵达云南省怒江州福贡县马吉乡中心小学。志愿者们为260名孩子逐一发放了合身的羽绒服、保暖内衣、帽子围巾手套三件套和防滑棉鞋。穿上新衣服的孩子们在操场上蹦蹦跳跳，有的孩子还把小脸埋进柔软的羽绒服里，开心地说"好暖和！"。本次发放过程全程录像，签收表已由学校校长和班主任签字确认。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=happy%20mountain%20children%20wearing%20new%20winter%20coats%20smiling&image_size=landscape_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=volunteers%20distributing%20winter%20clothes%20to%20rural%20school%20children&image_size=landscape_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=children%20playing%20in%20snow%20wearing%20warm%20jackets%20school%20playground&image_size=landscape_4_3',
    ],
    author: '志愿者赵队长',
    authorRole: '现场志愿者',
    isImportant: true,
    likes: 892,
    comments: 156,
    createdAt: '2025-11-20T16:00:00.000Z',
    updatedAt: '2025-11-21T09:30:00.000Z',
  },
  {
    id: 'progress-004',
    projectId: PROJECT_ID,
    title: '贵州毕节市完成6所小学物资发放',
    content:
      '继云南怒江州发放后，志愿者团队马不停蹄赶赴贵州省毕节市。截至11月28日，已完成威宁县和赫章县共6所小学580名儿童的冬衣发放。在赫章县结构乡中心小学，孩子们收到新衣服后集体向捐赠方向队敬礼，用稚嫩的声音喊出"谢谢叔叔阿姨！"，在场的志愿者和老师都被深深感动。发放过程中，志愿者还为孩子们上了一堂"冬季保暖小知识"课，教他们如何正确清洗和保养羽绒服。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=children%20saluting%20wearing%20new%20winter%20clothes%20gratitude&image_size=landscape_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=volunteers%20teaching%20children%20winter%20warmth%20tips%20classroom&image_size=landscape_4_3',
    ],
    author: '志愿者赵队长',
    authorRole: '现场志愿者',
    isImportant: false,
    likes: 623,
    comments: 87,
    createdAt: '2025-11-30T14:20:00.000Z',
    updatedAt: '2025-11-30T14:20:00.000Z',
  },
  {
    id: 'progress-005',
    projectId: PROJECT_ID,
    title: '来自山区孩子的感谢信和手绘卡片',
    content:
      '项目组收到了来自怒江州和毕节市孩子们寄来的一百余封感谢信和手绘卡片。福贡县马吉乡小学三年级的娜花小朋友在信中写道："谢谢阿姨送我的粉色羽绒服，穿着它去学校路上再也不冷了。我一定会好好学习，长大后也像你们一样帮助别人！"孩子们用彩笔画出了穿着新衣服的自己、太阳、爱心，还有他们心中的"美丽世界"。这些珍贵的礼物将被基金会珍藏，也希望每一位捐赠人都能感受到这份来自大山深处的纯真谢意。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=children%20handwritten%20thank%20you%20cards%20colorful%20drawings%20gratitude&image_size=landscape_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=child%20drawing%20heart%20sun%20happy%20kids%20colorful%20artwork&image_size=landscape_4_3',
    ],
    author: '阳光公益基金会',
    authorRole: '项目执行方',
    isImportant: false,
    likes: 1256,
    comments: 234,
    createdAt: '2025-12-08T10:00:00.000Z',
    updatedAt: '2025-12-08T10:00:00.000Z',
  },
];

export const getProgressByProject = (projectId: string): ProgressUpdate[] => {
  return progressUpdates
    .filter((p) => p.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getProgressById = (id: string): ProgressUpdate | undefined => {
  return progressUpdates.find((p) => p.id === id);
};

export const getImportantProgress = (projectId: string): ProgressUpdate[] => {
  return progressUpdates.filter((p) => p.projectId === projectId && p.isImportant);
};

export default progressUpdates;
