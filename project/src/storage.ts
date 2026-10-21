import { useState, useCallback } from 'react';
import type { AppData, Preferences } from './types';

const STORAGE_KEY = 'mynest:data:v1';
const CURRENT_VERSION = 1;

const defaultData: AppData = {
  version: CURRENT_VERSION,
  preferences: {
    displayName: '',
  },
  notes: [],
  tasks: [],
  habits: [],
  planner: [],
  journal: [],
  goals: [],
};

function sanitize(raw: unknown): AppData | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  if (typeof d.version !== 'number') return null;
  const prefs = d.preferences as Preferences | undefined;
  return {
    version: CURRENT_VERSION,
    preferences: {
      displayName:
        prefs && typeof prefs.displayName === 'string'
          ? prefs.displayName
          : '',
    },
    notes: Array.isArray(d.notes) ? (d.notes as AppData['notes']) : [],
    tasks: Array.isArray(d.tasks)
      ? (d.tasks as Record<string, unknown>[]).map((t) => ({
          ...t,
          subject: (t.subject as string) || 'General',
        })) as AppData['tasks']
      : [],
    habits: Array.isArray(d.habits) ? (d.habits as AppData['habits']) : [],
    planner: Array.isArray(d.planner) ? (d.planner as AppData['planner']) : [],
    journal: Array.isArray(d.journal) ? (d.journal as AppData['journal']) : [],
    goals: Array.isArray(d.goals) ? (d.goals as AppData['goals']) : [],
  };
}

export function loadFromStorage(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultData);
    const parsed = JSON.parse(raw);
    const safe = sanitize(parsed);
    if (!safe) {
      console.warn('MYNEST: corrupted data detected, using defaults');
      return structuredClone(defaultData);
    }
    return safe;
  } catch (e) {
    console.warn('MYNEST: storage read failed', e);
    return structuredClone(defaultData);
  }
}

export function saveToStorage(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('MYNEST: storage write failed', e);
    return false;
  }
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadFromStorage());

  const update = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      saveToStorage(next);
      return next;
    });
  }, []);

  const replaceAll = useCallback((incoming: AppData) => {
    const safe = sanitize(incoming);
    if (safe) {
      setData(safe);
      saveToStorage(safe);
      return true;
    }
    return false;
  }, []);

  const resetAll = useCallback(() => {
    const fresh = structuredClone(defaultData);
    setData(fresh);
    saveToStorage(fresh);
  }, []);

  const isFirstTime = !data.preferences.displayName;

  return { data, update, replaceAll, resetAll, isFirstTime };
}

export { STORAGE_KEY, CURRENT_VERSION };
