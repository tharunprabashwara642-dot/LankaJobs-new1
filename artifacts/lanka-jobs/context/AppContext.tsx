import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { demoJobs, Job } from '@/data/jobs';

type Language = 'English' | 'සිංහල' | 'தமிழ்';

type AppContextValue = {
  jobs: Job[];
  savedJobIds: string[];
  postedJobs: Job[];
  language: Language;
  isReady: boolean;
  toggleSaved: (jobId: string) => void;
  addJob: (job: Job) => void;
  updateLanguage: (language: Language) => void;
  getJob: (jobId: string) => Job | undefined;
};

const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY = '@lankajobs/local-state';

export function AppProvider({ children }: PropsWithChildren) {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [language, setLanguage] = useState<Language>('English');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!value) return;
        const parsed = JSON.parse(value) as Partial<{
          savedJobIds: string[];
          postedJobs: Job[];
          language: Language;
        }>;
        setSavedJobIds(parsed.savedJobIds ?? []);
        setPostedJobs(parsed.postedJobs ?? []);
        setLanguage(parsed.language ?? 'English');
      })
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ savedJobIds, postedJobs, language }),
    ).catch(() => undefined);
  }, [isReady, savedJobIds, postedJobs, language]);

  const jobs = useMemo(() => [...postedJobs, ...demoJobs], [postedJobs]);
  const value = useMemo<AppContextValue>(
    () => ({
      jobs,
      savedJobIds,
      postedJobs,
      language,
      isReady,
      toggleSaved: (jobId) => {
        setSavedJobIds((current) =>
          current.includes(jobId)
            ? current.filter((id) => id !== jobId)
            : [...current, jobId],
        );
      },
      addJob: (job) => setPostedJobs((current) => [job, ...current]),
      updateLanguage: (nextLanguage) => setLanguage(nextLanguage),
      getJob: (jobId) => jobs.find((job) => job.id === jobId),
    }),
    [isReady, jobs, language, postedJobs, savedJobIds],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
