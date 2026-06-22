import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Project, Donation, Expense, Dispute, ProgressUpdate, DisputeReply } from '@/types';
import { projects as defaultProjects } from '@/data/projects';
import { donations as defaultDonations } from '@/data/donations';
import { expenses as defaultExpenses } from '@/data/expenses';
import { disputes as defaultDisputes } from '@/data/disputes';
import { progressUpdates as defaultProgress } from '@/data/progress';
import storage from '@/utils/storage';

interface DataState {
  projects: Project[];
  donations: Donation[];
  expenses: Expense[];
  disputes: Dispute[];
  progressUpdates: ProgressUpdate[];

  getProjects: () => Project[];
  getProjectById: (id: string) => Project | undefined;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  getDonationsByProject: (projectId: string) => Donation[];
  getPublicDonationsByProject: (projectId: string) => Donation[];
  getAnonymousDonationsByProject: (projectId: string) => Donation[];
  getDonationById: (id: string) => Donation | undefined;
  getTopDonations: (projectId: string, limit?: number) => Donation[];
  addDonation: (donation: Omit<Donation, 'id' | 'createdAt'>) => void;
  updateDonation: (id: string, updates: Partial<Donation>) => void;
  deleteDonation: (id: string) => void;

  getExpensesByProject: (projectId: string) => Expense[];
  getExpenseById: (id: string) => Expense | undefined;
  getApprovedExpenses: (projectId: string) => Expense[];
  getRecentExpenses: (projectId: string, limit?: number) => Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  getDisputesByProject: (projectId: string) => Dispute[];
  getDisputesByExpense: (expenseId: string) => Dispute[];
  getDisputeById: (id: string) => Dispute | undefined;
  addDispute: (dispute: Omit<Dispute, 'id' | 'createdAt' | 'updatedAt' | 'replies'>) => void;
  updateDispute: (id: string, updates: Partial<Dispute>) => void;
  addDisputeReply: (disputeId: string, reply: Omit<DisputeReply, 'id' | 'createdAt'>) => void;
  deleteDispute: (id: string) => void;

  getProgressByProject: (projectId: string) => ProgressUpdate[];
  getProgressById: (id: string) => ProgressUpdate | undefined;
  addProgress: (progress: Omit<ProgressUpdate, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>) => void;
  updateProgress: (id: string, updates: Partial<ProgressUpdate>) => void;
  deleteProgress: (id: string) => void;

  calculateTotalRaised: (projectId: string) => number;
  calculateTotalExpenses: (projectId: string, includePending?: boolean) => number;
  calculateDonorCount: (projectId: string) => number;
}

const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      projects: defaultProjects,
      donations: defaultDonations,
      expenses: defaultExpenses,
      disputes: defaultDisputes,
      progressUpdates: defaultProgress,

      getProjects: () => get().projects,
      getProjectById: (id) => get().projects.find((p) => p.id === id),
      addProject: (project) => {
        const now = new Date().toISOString();
        const newProject: Project = {
          ...project,
          id: generateId('proj'),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          donations: state.donations.filter((d) => d.projectId !== id),
          expenses: state.expenses.filter((e) => e.projectId !== id),
          disputes: state.disputes.filter((d) => d.projectId !== id),
          progressUpdates: state.progressUpdates.filter((p) => p.projectId !== id),
        }));
      },

      getDonationsByProject: (projectId) =>
        get()
          .donations.filter((d) => d.projectId === projectId && d.status === 'success')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getPublicDonationsByProject: (projectId) =>
        get()
          .donations.filter((d) => d.projectId === projectId && !d.isAnonymous && d.status === 'success')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getAnonymousDonationsByProject: (projectId) =>
        get()
          .donations.filter((d) => d.projectId === projectId && d.isAnonymous && d.status === 'success')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getDonationById: (id) => get().donations.find((d) => d.id === id),
      getTopDonations: (projectId, limit = 10) =>
        get()
          .donations.filter((d) => d.projectId === projectId && d.status === 'success')
          .sort((a, b) => b.amount - a.amount)
          .slice(0, limit),
      addDonation: (donation) => {
        const now = new Date().toISOString();
        const newDonation: Donation = {
          ...donation,
          id: generateId('don'),
          createdAt: now,
        };
        set((state) => ({ donations: [...state.donations, newDonation] }));
      },
      updateDonation: (id, updates) => {
        set((state) => ({
          donations: state.donations.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }));
      },
      deleteDonation: (id) => {
        set((state) => ({ donations: state.donations.filter((d) => d.id !== id) }));
      },

      getExpensesByProject: (projectId) =>
        get()
          .expenses.filter((e) => e.projectId === projectId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getExpenseById: (id) => get().expenses.find((e) => e.id === id),
      getApprovedExpenses: (projectId) =>
        get()
          .expenses.filter((e) => e.projectId === projectId && e.status === 'approved')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getRecentExpenses: (projectId, limit = 5) =>
        get()
          .expenses.filter((e) => e.projectId === projectId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit),
      addExpense: (expense) => {
        const now = new Date().toISOString();
        const newExpense: Expense = {
          ...expense,
          id: generateId('exp'),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ expenses: [...state.expenses, newExpense] }));
      },
      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }));
      },
      deleteExpense: (id) => {
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
      },

      getDisputesByProject: (projectId) =>
        get()
          .disputes.filter((d) => d.projectId === projectId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getDisputesByExpense: (expenseId) =>
        get()
          .disputes.filter((d) => d.expenseId === expenseId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getDisputeById: (id) => get().disputes.find((d) => d.id === id),
      addDispute: (dispute) => {
        const now = new Date().toISOString();
        const newDispute: Dispute = {
          ...dispute,
          id: generateId('dispute'),
          createdAt: now,
          updatedAt: now,
          replies: [],
        };
        set((state) => ({ disputes: [...state.disputes, newDispute] }));
      },
      updateDispute: (id, updates) => {
        set((state) => ({
          disputes: state.disputes.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
          ),
        }));
      },
      addDisputeReply: (disputeId, reply) => {
        const now = new Date().toISOString();
        const newReply: DisputeReply = {
          ...reply,
          id: generateId('reply'),
          createdAt: now,
        };
        set((state) => ({
          disputes: state.disputes.map((d) =>
            d.id === disputeId
              ? { ...d, replies: [...d.replies, newReply], updatedAt: now }
              : d
          ),
        }));
      },
      deleteDispute: (id) => {
        set((state) => ({ disputes: state.disputes.filter((d) => d.id !== id) }));
      },

      getProgressByProject: (projectId) =>
        get()
          .progressUpdates.filter((p) => p.projectId === projectId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getProgressById: (id) => get().progressUpdates.find((p) => p.id === id),
      addProgress: (progress) => {
        const now = new Date().toISOString();
        const newProgress: ProgressUpdate = {
          ...progress,
          id: generateId('progress'),
          createdAt: now,
          updatedAt: now,
          likes: 0,
          comments: 0,
        };
        set((state) => ({ progressUpdates: [...state.progressUpdates, newProgress] }));
      },
      updateProgress: (id, updates) => {
        set((state) => ({
          progressUpdates: state.progressUpdates.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      deleteProgress: (id) => {
        set((state) => ({ progressUpdates: state.progressUpdates.filter((p) => p.id !== id) }));
      },

      calculateTotalRaised: (projectId) =>
        get()
          .donations.filter((d) => d.projectId === projectId && d.status === 'success')
          .reduce((sum, d) => sum + d.amount, 0),
      calculateTotalExpenses: (projectId, includePending = false) =>
        get()
          .expenses.filter(
            (e) =>
              e.projectId === projectId &&
              (e.status === 'approved' ||
                (includePending && (e.status === 'pending' || e.status === 'disputed')))
          )
          .reduce((sum, e) => sum + e.amount, 0),
      calculateDonorCount: (projectId) => {
        const donorNames = new Set(
          get()
            .donations.filter((d) => d.projectId === projectId && d.status === 'success')
            .map((d) => (d.isAnonymous ? `anon-${d.id}` : d.donorName))
        );
        return donorNames.size;
      },
    }),
    {
      name: 'charity-data-store',
      storage: createJSONStorage(() => ({
        getItem: (key) => {
          const value = storage.get<string>(key.replace('charity-data-store:', ''));
          return value ?? null;
        },
        setItem: (key, value) => {
          storage.set(key.replace('charity-data-store:', ''), value);
        },
        removeItem: (key) => {
          storage.remove(key.replace('charity-data-store:', ''));
        },
      })),
      partialize: (state) => ({
        projects: state.projects,
        donations: state.donations,
        expenses: state.expenses,
        disputes: state.disputes,
        progressUpdates: state.progressUpdates,
      }),
    }
  )
);

export default useDataStore;
