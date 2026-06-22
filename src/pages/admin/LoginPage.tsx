import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Heart,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabContent } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore, type UserRole } from '@/store/authStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [activeRole, setActiveRole] = React.useState<UserRole>('org_admin');
  const [formData, setFormData] = React.useState({
    org_admin: { username: 'admin@sunshine.org', password: 'admin123' },
    auditor: { username: 'auditor@trust.org', password: 'audit123' },
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname;

  const handleInputChange = (field: 'username' | 'password', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [activeRole]: { ...prev[activeRole], [field]: value },
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const currentForm = formData[activeRole];

    if (!currentForm.username.trim()) {
      setError('请输入账号');
      setLoading(false);
      return;
    }
    if (!currentForm.password.trim()) {
      setError('请输入密码');
      setLoading(false);
      return;
    }

    const success = await login({
      username: currentForm.username,
      password: currentForm.password,
      role: activeRole,
    });

    setLoading(false);

    if (success) {
      const target = from ?? (activeRole === 'auditor' ? '/audit' : '/admin');
      navigate(target, { replace: true });
    } else {
      setError('账号或密码错误，请重试');
    }
  };

  const roleTabs = [
    {
      value: 'org_admin',
      label: '机构登录',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      value: 'auditor',
      label: '审核员登录',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const hints: Record<UserRole, { title: string; desc: string }> = {
    org_admin: {
      title: '机构管理员',
      desc: '管理项目、录入支出、回应质疑',
    },
    auditor: {
      title: '独立审核员',
      desc: '审核支出凭证、调解争议问题',
    },
    public: {
      title: '公众用户',
      desc: '浏览公益项目和支出明细',
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-primary-50/50 to-secondary-50/50 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-secondary-200/40 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-warning-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-soft mb-4">
            <Heart className="w-8 h-8 text-white fill-white/30" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            公益募捐透明度看板
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            登录管理后台，守护每一份善意
          </p>
        </div>

        <Card className="p-0 overflow-hidden shadow-glass">
          <div className="p-6 pb-0">
            <Tabs
              tabs={roleTabs}
              value={activeRole}
              onChange={(v) => {
                setActiveRole(v as UserRole);
                setError(null);
              }}
            />
          </div>

          <div className="p-6 pt-4">
            <TabContent value="org_admin" activeValue={activeRole}>
              <div className="mb-5 p-3 rounded-xl bg-primary-50/70 border border-primary-100">
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-primary-800">
                      {hints.org_admin.title}
                    </div>
                    <div className="text-xs text-primary-600/80 mt-0.5">
                      {hints.org_admin.desc}
                    </div>
                  </div>
                </div>
              </div>
            </TabContent>

            <TabContent value="auditor" activeValue={activeRole}>
              <div className="mb-5 p-3 rounded-xl bg-secondary-50/70 border border-secondary-100">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-secondary-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-secondary-800">
                      {hints.auditor.title}
                    </div>
                    <div className="text-xs text-secondary-600/80 mt-0.5">
                      {hints.auditor.desc}
                    </div>
                  </div>
                </div>
              </div>
            </TabContent>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-danger-50 border border-danger-100 flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-danger-600 mt-0.5 shrink-0" />
                <span className="text-sm text-danger-700">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  账号
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData[activeRole].username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="请输入账号/邮箱"
                    className={cn(
                      'w-full h-11 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white/80',
                      'text-sm text-slate-800 placeholder:text-slate-400',
                      'transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50'
                    )}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData[activeRole].password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="请输入密码"
                    className={cn(
                      'w-full h-11 pl-11 pr-11 rounded-xl border-2 border-slate-200 bg-white/80',
                      'text-sm text-slate-800 placeholder:text-slate-400',
                      'transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50'
                    )}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    defaultChecked
                  />
                  <span className="text-slate-600">记住账号</span>
                </label>
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                  onClick={(e) => e.preventDefault()}
                >
                  忘记密码?
                </a>
              </div>

              <Button
                type="submit"
                variant={activeRole === 'auditor' ? 'secondary' : 'primary'}
                size="lg"
                loading={loading}
                className="w-full mt-2"
              >
                登录{activeRole === 'auditor' ? '审核后台' : '机构后台'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-xs text-slate-400 text-center mb-2.5">
                演示账号
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="font-medium text-slate-700">机构管理员</div>
                  <div className="text-slate-500 mt-0.5 truncate">
                    admin@sunshine.org
                  </div>
                  <div className="text-slate-400">admin123</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="font-medium text-slate-700">审核员</div>
                  <div className="text-slate-500 mt-0.5 truncate">
                    auditor@trust.org
                  </div>
                  <div className="text-slate-400">audit123</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center text-xs text-slate-400">
          登录即表示您同意{' '}
          <a href="#" className="text-primary-500 hover:underline" onClick={(e) => e.preventDefault()}>
            用户协议
          </a>{' '}
          和{' '}
          <a href="#" className="text-primary-500 hover:underline" onClick={(e) => e.preventDefault()}>
            隐私政策
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
