import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, clearAccessToken, getAccessToken, saveAccessToken, type ApiProfile, type ApiUser } from '@/api';
import { Job, JobStatus } from '@/data/jobs';

type Language = 'English' | 'සිංහල' | 'தமிழ்';
export type AppCategory = { id: string; name: string; slug: string; icon: string; isActive: boolean };

type AppContextValue = {
  jobs: Job[];
  savedJobIds: string[];
  postedJobs: Job[];
  categories: AppCategory[];
  language: Language;
  authUser: ApiUser | null;
  profile: ApiProfile | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  toggleSaved: (jobId: string) => Promise<void>;
  addJob: (input: Record<string, unknown>) => Promise<Job>;
  updateProfile: (input: Record<string, unknown>) => Promise<void>;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateLanguage: (language: Language) => void;
  getJob: (jobId: string) => Job | undefined;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const LANGUAGE_KEY = '@lankajobs/language';

function mapStatus(status: string): JobStatus {
  return ({ DRAFT: 'draft', PENDING_REVIEW: 'pending', PUBLISHED: 'published', REJECTED: 'rejected', EXPIRED: 'expired', SUSPENDED: 'cancelled' } as Record<string, JobStatus>)[status] ?? 'draft';
}

function mapJob(value: Record<string, any>): Job {
  return {
    id: value.id,
    title: value.title,
    company: value.company,
    companyMark: value.companyMark ?? value.company?.slice(0, 2).toUpperCase() ?? '?',
    description: value.description,
    category: value.category ?? 'Other',
    location: value.location,
    employmentType: value.employmentType,
    salary: value.salary,
    experience: value.experience ?? '',
    education: value.education ?? '',
    skills: value.skills ?? [],
    postedAt: value.postedAt ?? value.createdAt,
    closingDate: value.closingDate ?? '',
    applicationEmail: value.applicationEmail,
    applicationUrl: value.applicationUrl,
    workMode: value.workMode,
    status: mapStatus(value.status),
    createdBy: value.createdBy ?? value.ownerId,
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [language, setLanguage] = useState<Language>('English');
  const [authUser, setAuthUser] = useState<ApiUser | null>(null);
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [jobResult, categoryResult] = await Promise.all([
        apiRequest<{ data: Record<string, any>[] }>('/api/jobs?page=1&pageSize=50'),
        apiRequest<{ data: AppCategory[] }>('/api/categories'),
      ]);
      setJobs(jobResult.data.map(mapJob));
      setCategories(categoryResult.data);
      const token = await getAccessToken();
      if (token) {
        const [me, saved, mine] = await Promise.all([
          apiRequest<{ user: ApiUser; profile: ApiProfile | null }>('/api/auth/me'),
          apiRequest<{ data: Record<string, any>[] }>('/api/saved-jobs'),
          apiRequest<{ data: Record<string, any>[] }>('/api/jobs/mine'),
        ]);
        setAuthUser(me.user);
        setProfile(me.profile);
        setSavedJobIds(saved.data.map((job: Record<string, any>) => job.id));
        setPostedJobs(mine.data.map(mapJob));
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to load LankaJobs right now.';
      setError(message);
      if (String(message).includes('401')) {
        await clearAccessToken();
        setAuthUser(null);
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void AsyncStorage.getItem(LANGUAGE_KEY).then((value) => {
      if (value === 'English' || value === 'සිංහල' || value === 'தமிழ்') setLanguage(value);
    });
    void refresh();
  }, [refresh]);

  const value = useMemo<AppContextValue>(() => ({
    jobs,
    savedJobIds,
    postedJobs,
    categories,
    language,
    authUser,
    profile,
    isReady,
    isLoading,
    error,
    toggleSaved: async (jobId) => {
      if (!authUser) throw new Error('Sign in to save jobs across devices.');
      const isSaved = savedJobIds.includes(jobId);
      if (isSaved) {
        await apiRequest(`/api/saved-jobs/${jobId}`, { method: 'DELETE' });
        setSavedJobIds((current) => current.filter((id) => id !== jobId));
      } else {
        await apiRequest(`/api/saved-jobs/${jobId}`, { method: 'POST' });
        setSavedJobIds((current) => [...current, jobId]);
      }
    },
    addJob: async (input) => {
      if (!authUser) throw new Error('Sign in to post a job.');
      const created = await apiRequest<Record<string, any>>('/api/jobs', { method: 'POST', body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' } });
      const job = mapJob(created);
      setPostedJobs((current) => [job, ...current]);
      setJobs((current) => [job, ...current.filter((item) => item.id !== job.id)]);
      return job;
    },
    updateProfile: async (input) => {
      const result = await apiRequest<{ user: ApiUser; profile: ApiProfile }>('/api/profile', { method: 'PUT', body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' } });
      setAuthUser(result.user);
      setProfile(result.profile);
    },
    signIn: async (token) => {
      await saveAccessToken(token);
      await refresh();
    },
    signOut: async () => {
      try { await apiRequest('/api/auth/logout', { method: 'POST' }); } finally {
        await clearAccessToken();
        setAuthUser(null);
        setProfile(null);
        setSavedJobIds([]);
        setPostedJobs([]);
      }
    },
    updateLanguage: (nextLanguage) => {
      setLanguage(nextLanguage);
      void AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
    },
    getJob: (jobId) => jobs.find((job) => job.id === jobId),
    refresh,
  }), [authUser, categories, error, isLoading, isReady, jobs, language, postedJobs, profile, refresh, savedJobIds]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}