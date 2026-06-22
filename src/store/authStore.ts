import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/utils/storage';

export type UserRole = 'public' | 'org_admin' | 'auditor';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  phone?: string;
  orgName?: string;
  orgId?: string;
  permissions?: string[];
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
  role: UserRole;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUser: (user: Partial<User>) => void;
}

const defaultOrgAdmin: User = {
  id: 'org-admin-001',
  username: 'admin@sunshine.org',
  name: '张明',
  role: 'org_admin',
  email: 'admin@sunshine.org',
  phone: '138****8888',
  orgName: '阳光公益基金会',
  orgId: 'org-sunshine-001',
  avatar: undefined,
  permissions: [
    'project:read',
    'project:write',
    'project:delete',
    'expense:read',
    'expense:write',
    'expense:submit',
    'dispute:read',
    'dispute:reply',
    'donation:read',
    'report:read',
    'report:export',
  ],
  lastLoginAt: undefined,
  createdAt: '2024-01-15T00:00:00.000Z',
};

const defaultAuditor: User = {
  id: 'auditor-001',
  username: 'auditor@trust.org',
  name: '李华',
  role: 'auditor',
  email: 'auditor@trust.org',
  phone: '139****9999',
  orgName: '公信第三方审计机构',
  orgId: 'org-trust-audit-001',
  avatar: undefined,
  permissions: [
    'project:read',
    'expense:read',
    'expense:approve',
    'expense:reject',
    'dispute:read',
    'dispute:mediate',
    'donation:read',
    'report:read',
    'report:audit',
  ],
  lastLoginAt: undefined,
  createdAt: '2024-02-20T00:00:00.000Z',
};

const defaultPublic: User = {
  id: 'public-user-000',
  username: 'guest',
  name: '访客用户',
  role: 'public',
  avatar: undefined,
  permissions: ['project:read', 'expense:read', 'donation:read'],
  lastLoginAt: undefined,
  createdAt: undefined,
};

const mockUsers: Record<string, User> = {
  'admin@sunshine.org': defaultOrgAdmin,
  'auditor@trust.org': defaultAuditor,
  'guest': defaultPublic,
};

const mockPasswords: Record<string, string> = {
  'admin@sunshine.org': 'admin123',
  'auditor@trust.org': 'audit123',
  'guest': 'guest123',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,

      login: async (credentials: AuthCredentials) => {
        await new Promise((resolve) => setTimeout(resolve, 600));

        const { username, password, role } = credentials;
        const user = mockUsers[username];

        if (!user || user.role !== role) {
          return false;
        }

        if (mockPasswords[username] !== password) {
          return false;
        }

        const loginTime = new Date().toISOString();
        const loggedInUser: User = {
          ...user,
          lastLoginAt: loginTime,
        };

        set({
          isAuthenticated: true,
          currentUser: loggedInUser,
        });

        return true;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          currentUser: null,
        });
      },

      switchRole: (role: UserRole) => {
        set((state) => {
          if (!state.currentUser) return state;

          let newUser: User;
          if (role === 'org_admin') {
            newUser = {
              ...defaultOrgAdmin,
              lastLoginAt: state.currentUser.lastLoginAt,
            };
          } else if (role === 'auditor') {
            newUser = {
              ...defaultAuditor,
              lastLoginAt: state.currentUser.lastLoginAt,
            };
          } else {
            newUser = {
              ...defaultPublic,
              lastLoginAt: state.currentUser.lastLoginAt,
            };
          }

          return {
            ...state,
            currentUser: newUser,
          };
        });
      },

      updateUser: (userUpdates: Partial<User>) => {
        set((state) => {
          if (!state.currentUser) return state;
          return {
            ...state,
            currentUser: {
              ...state.currentUser,
              ...userUpdates,
            },
          };
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          const value = storage.get<string>(name);
          return value ?? null;
        },
        setItem: (name: string, value: string) => {
          storage.set(name, value);
        },
        removeItem: (name: string) => {
          storage.remove(name);
        },
      })),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
      }),
    }
  )
);

export const getDefaultUserByRole = (role: UserRole): User => {
  switch (role) {
    case 'org_admin':
      return defaultOrgAdmin;
    case 'auditor':
      return defaultAuditor;
    default:
      return defaultPublic;
  }
};

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    public: '公众用户',
    org_admin: '机构管理员',
    auditor: '审核员',
  };
  return labels[role];
};

export const hasPermission = (
  user: User | null | undefined,
  permission: string
): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

export default useAuthStore;
