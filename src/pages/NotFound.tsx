import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser);

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);
  const handleLogin = () => navigate('/login', { state: { from: location } });

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    return currentUser.role === 'auditor' ? '/audit/dashboard' : '/admin/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50/40 px-4">
      <div className="w-full max-w-lg text-center">
        <div className="relative mb-8">
          <div className="text-[120px] md:text-[160px] font-black leading-none bg-gradient-to-r from-primary-200 via-primary-400 to-primary-600 bg-clip-text text-transparent select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary-100/60 blur-2xl" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
          页面走丢了
        </h1>
        <p className="text-base text-slate-500 mb-8 leading-relaxed">
          您访问的页面可能已被移动、删除或暂时不可用
          <br />
          <span className="text-sm text-slate-400 mt-1 inline-block">
            请求地址：{location.pathname}
          </span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" onClick={handleGoHome} className="w-full sm:w-auto">
            <Home className="w-4 h-4 mr-2" />
            返回公开首页
          </Button>
          <Button variant="outline" onClick={handleGoBack} className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一页
          </Button>
          {!currentUser ? (
            <Button variant="secondary" onClick={handleLogin} className="w-full sm:w-auto">
              <LogIn className="w-4 h-4 mr-2" />
              登录后台
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => navigate(getDashboardLink())}
              className="w-full sm:w-auto"
            >
              <Home className="w-4 h-4 mr-2" />
              进入工作台
            </Button>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-4">快速导航</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <button
              onClick={() => navigate('/')}
              className="text-slate-500 hover:text-primary-600 transition-colors"
            >
              公益项目看板
            </button>
            <button
              onClick={() => navigate('/project/proj-sunshine-001')}
              className="text-slate-500 hover:text-primary-600 transition-colors"
            >
              山区儿童温暖冬衣计划
            </button>
            {currentUser?.role === 'org_admin' && (
              <>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="text-slate-500 hover:text-primary-600 transition-colors"
                >
                  机构管理后台
                </button>
                <button
                  onClick={() => navigate('/admin/expenses')}
                  className="text-slate-500 hover:text-primary-600 transition-colors"
                >
                  支出凭证管理
                </button>
              </>
            )}
            {currentUser?.role === 'auditor' && (
              <>
                <button
                  onClick={() => navigate('/audit/dashboard')}
                  className="text-slate-500 hover:text-primary-600 transition-colors"
                >
                  审核中心
                </button>
                <button
                  onClick={() => navigate('/audit/vouchers')}
                  className="text-slate-500 hover:text-primary-600 transition-colors"
                >
                  凭证审核
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
