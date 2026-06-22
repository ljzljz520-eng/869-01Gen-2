import type { Project } from '@/types';

export const PROJECT_ID = 'proj-2025-mountain-winter';

export const projects: Project[] = [
  {
    id: PROJECT_ID,
    title: '山区儿童温暖冬衣计划',
    description:
      '为云南、贵州偏远山区的留守儿童送去温暖冬衣，让孩子们度过一个温暖的冬天。项目覆盖云南省怒江傈僳族自治州、贵州省毕节市等8个国家级贫困县的32所乡村小学，共计1,200余名儿童。',
    coverImage:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20village%20children%20wearing%20warm%20winter%20clothes%20smiling%20in%20snowy%20countryside%20china%20warm%20sunlight%20heartwarming&image_size=landscape_16_9',
    targetAmount: 500000,
    raisedAmount: 387650,
    donorCount: 2847,
    beneficiaryCount: 1200,
    beneficiary: '云南贵州山区留守儿童',
    organizer: '阳光公益基金会',
    startTime: '2025-09-01T00:00:00.000Z',
    endTime: '2025-12-31T23:59:59.999Z',
    status: 'ongoing',
    location: '云南省怒江傈僳族自治州、贵州省毕节市',
    tags: ['儿童关爱', '衣物捐赠', '冬季救助', '山区教育'],
    category: '儿童福利',
    createdAt: '2025-08-15T10:00:00.000Z',
    updatedAt: '2025-12-01T08:30:00.000Z',
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return projects.find((p) => p.id === id);
};

export const getMainProject = (): Project => {
  return projects[0];
};

export default projects;
