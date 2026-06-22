import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Upload,
  MapPin,
  Calendar,
  Users,
  Target,
  Tag,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import {
  AdminSidebar,
  type SidebarNavItem,
} from '@/components/layout/AdminSidebar';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Tabs, TabContent } from '@/components/ui/Tabs';
import { useAuthStore } from '@/store/authStore';
import type { Project } from '@/types';
import { projects as initialProjects } from '@/data/projects';
import { formatAmountShort, formatDate, formatPercent } from '@/utils/formatter';
import { cn } from '@/lib/utils';

const ProjectManagePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const [activeNav, setActiveNav] = React.useState('projects');
  const [collapsed, setCollapsed] = React.useState(false);
  const [projectList, setProjectList] = React.useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const defaultForm: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'donorCount' | 'beneficiaryCount' | 'raisedAmount'> = {
    title: '',
    description: '',
    coverImage: '',
    targetAmount: 0,
    beneficiary: '',
    organizer: currentUser?.orgName ?? '阳光公益基金会',
    startTime: new Date().toISOString().slice(0, 10),
    endTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'ongoing',
    location: '',
    tags: [],
    category: '',
  };

  const [formData, setFormData] = React.useState(defaultForm);
  const [tagInput, setTagInput] = React.useState('');

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
      { value: 'expenses', label: '支出管理', icon: <Sparkles className="w-5 h-5" /> },
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

  const filteredProjects = React.useMemo(() => {
    return projectList.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projectList, searchQuery, statusFilter]);

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'ongoing':
        return <Badge variant="approved">进行中</Badge>;
      case 'completed':
        return <Badge variant="approved">已完成</Badge>;
      case 'suspended':
        return <Badge variant="rejected">已暂停</Badge>;
      default:
        return null;
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData(defaultForm);
    setFormErrors({});
    setTagInput('');
    setModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      coverImage: project.coverImage,
      targetAmount: project.targetAmount,
      beneficiary: project.beneficiary,
      organizer: project.organizer,
      startTime: project.startTime.slice(0, 10),
      endTime: project.endTime.slice(0, 10),
      status: project.status,
      location: project.location,
      tags: [...project.tags],
      category: project.category,
    });
    setFormErrors({});
    setTagInput('');
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = '请输入项目标题';
    if (!formData.description.trim()) errors.description = '请输入项目描述';
    if (formData.targetAmount <= 0) errors.targetAmount = '目标金额必须大于0';
    if (!formData.beneficiary.trim()) errors.beneficiary = '请填写受益对象';
    if (!formData.location.trim()) errors.location = '请填写项目地点';
    if (!formData.category.trim()) errors.category = '请选择项目分类';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    if (editingProject) {
      setProjectList((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                ...formData,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
    } else {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        raisedAmount: 0,
        donorCount: 0,
        beneficiaryCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjectList((prev) => [newProject, ...prev]);
    }

    setSubmitLoading(false);
    setModalOpen(false);
  };

  const handleDelete = (project: Project) => {
    if (window.confirm(`确定删除项目"${project.title}"吗？此操作不可撤销。`)) {
      setProjectList((prev) => prev.filter((p) => p.id !== project.id));
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const inputClass = (field: string) =>
    cn(
      'w-full h-11 px-4 rounded-xl border-2 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400',
      'transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50',
      formErrors[field] ? 'border-danger-300 focus:border-danger-400 focus:ring-danger-100/50' : 'border-slate-200'
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
            <h1 className="text-lg font-bold text-slate-800">项目管理</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              管理您机构发起的所有公益项目
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            新建项目
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索项目标题或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50"
                />
              </div>

              <Tabs
                variant="pills"
                tabs={[
                  { value: 'all', label: `全部 (${projectList.length})` },
                  {
                    value: 'ongoing',
                    label: `进行中 (${projectList.filter((p) => p.status === 'ongoing').length})`,
                  },
                  {
                    value: 'completed',
                    label: `已完成 (${projectList.filter((p) => p.status === 'completed').length})`,
                  },
                  {
                    value: 'suspended',
                    label: `已暂停 (${projectList.filter((p) => p.status === 'suspended').length})`,
                  },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full lg:w-auto"
              />
            </div>
          </Card>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const progress = Math.min(
                100,
                (project.raisedAmount / project.targetAmount) * 100
              );
              return (
                <Card
                  key={project.id}
                  className="overflow-hidden group hover:shadow-glass-hover transition-all duration-300"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          目标 {formatAmountShort(project.targetAmount)}
                        </div>
                        <div className="text-base font-bold text-white">
                          {formatAmountShort(project.raisedAmount)}
                          <span className="text-xs font-medium text-white/70 ml-1">
                            ({formatPercent(project.raisedAmount, project.targetAmount)})
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold border border-white/30">
                        {progress.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="h-1.5 bg-slate-100">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <CardContent className="pt-5">
                    <h3 className="text-base font-bold text-slate-800 line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{project.donorCount.toLocaleString()} 人捐赠</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{project.location.split('、')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 col-span-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {formatDate(project.startTime, 'date')} ~ {formatDate(project.endTime, 'date')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4" />}
                        className="flex-1"
                      >
                        查看
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit3 className="w-4 h-4" />}
                        onClick={() => openEditModal(project)}
                      >
                        编辑
                      </Button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="col-span-full">
                <Card className="p-12">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mb-4">
                      <FolderPlus className="w-8 h-8" />
                    </div>
                    <div className="text-base font-semibold text-slate-700">
                      暂无匹配的项目
                    </div>
                    <div className="text-sm text-slate-500 mt-1.5">
                      试试调整搜索条件，或者创建一个新项目
                    </div>
                    <Button
                      className="mt-5"
                      variant="primary"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={openCreateModal}
                    >
                      新建项目
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </section>
        </div>
      </main>

      <Modal
        open={modalOpen}
        onClose={() => !submitLoading && setModalOpen(false)}
        size="xl"
        title={editingProject ? '编辑项目' : '创建新项目'}
        description={editingProject ? '修改项目的基本信息和设置' : '填写以下信息来发起一个新的公益筹款项目'}
        closeOnOverlayClick={!submitLoading}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              项目标题 <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              placeholder="请输入项目标题，简洁有力"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
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
                项目分类 <span className="text-danger-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className={inputClass('category')}
              >
                <option value="">请选择分类</option>
                <option value="儿童福利">儿童福利</option>
                <option value="教育助学">教育助学</option>
                <option value="医疗救助">医疗救助</option>
                <option value="灾害救援">灾害救援</option>
                <option value="养老关怀">养老关怀</option>
                <option value="环境保护">环境保护</option>
                <option value="动物保护">动物保护</option>
                <option value="社区发展">社区发展</option>
                <option value="其他">其他公益</option>
              </select>
              {formErrors.category && (
                <p className="text-xs text-danger-600">{formErrors.category}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                项目状态
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as Project['status'],
                  }))
                }
                className={inputClass('')}
              >
                <option value="ongoing">进行中</option>
                <option value="completed">已完成</option>
                <option value="suspended">已暂停</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                目标金额 <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  ¥
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="请输入筹款目标金额"
                  value={formData.targetAmount || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetAmount: Number(e.target.value) || 0,
                    }))
                  }
                  className={cn(inputClass('targetAmount'), 'pl-8')}
                />
              </div>
              {formErrors.targetAmount && (
                <p className="text-xs text-danger-600">{formErrors.targetAmount}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                受益对象 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                placeholder="如：山区留守儿童"
                value={formData.beneficiary}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, beneficiary: e.target.value }))
                }
                className={inputClass('beneficiary')}
              />
              {formErrors.beneficiary && (
                <p className="text-xs text-danger-600">{formErrors.beneficiary}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                开始日期
              </label>
              <input
                type="date"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                }
                className={inputClass('')}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                结束日期
              </label>
              <input
                type="date"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className={inputClass('')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              项目地点 <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              placeholder="如：云南省怒江州、贵州省毕节市"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className={inputClass('location')}
            />
            {formErrors.location && (
              <p className="text-xs text-danger-600">{formErrors.location}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              项目描述 <span className="text-danger-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="详细描述项目背景、目标、执行计划等信息，让捐赠人更了解您的项目..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className={cn(
                inputClass('description'),
                'h-auto py-3 resize-none'
              )}
            />
            {formErrors.description && (
              <p className="text-xs text-danger-600">{formErrors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              项目标签
            </label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl border-2 border-slate-200 bg-white/50 min-h-[52px]">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium border border-primary-100"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-primary-500 hover:text-primary-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex-1 flex min-w-[120px]">
                <input
                  type="text"
                  placeholder={formData.tags.length === 0 ? '输入标签按回车添加' : ''}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              封面图片
            </label>
            <div className="relative">
              {formData.coverImage ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 aspect-video">
                  <img
                    src={formData.coverImage}
                    alt="封面预览"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <div className="text-sm font-medium text-slate-600">
                    点击上传或拖拽图片至此
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    建议尺寸 1280×720，支持 JPG/PNG
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setFormData((prev) => ({
                            ...prev,
                            coverImage: reader.result as string,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <div className="pt-2">
              <Tabs
                variant="pills"
                tabs={[
                  { value: 'upload', label: '本地上传' },
                  { value: 'url', label: '图片链接' },
                ]}
                value="url"
                onChange={() => {}}
                className="w-full max-w-xs"
              />
              <TabContent value="url" activeValue="url">
                <input
                  type="text"
                  placeholder="或粘贴图片URL..."
                  value={formData.coverImage.startsWith('http') ? formData.coverImage : ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
                  }
                  className={cn(inputClass(''), 'mt-3')}
                />
              </TabContent>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setModalOpen(false)}
            disabled={submitLoading}
          >
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitLoading}
            leftIcon={editingProject ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          >
            {editingProject ? '保存修改' : '创建项目'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProjectManagePage;
