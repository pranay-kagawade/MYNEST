export type Priority = 'low' | 'medium' | 'high';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  createdAt: number;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
  records: Record<string, boolean>; // dateKey -> completed
}

export interface PlannerEntry {
  id: string;
  time: string;
  activity: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  mood: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  createdAt: number;
}

export interface Preferences {
  displayName: string;
}

export interface AppData {
  version: number;
  preferences: Preferences;
  notes: Note[];
  tasks: Task[];
  habits: Habit[];
  planner: PlannerEntry[];
  journal: JournalEntry[];
  goals: Goal[];
}

export type Page =
  | 'dashboard'
  | 'notes'
  | 'tasks'
  | 'habits'
  | 'focus'
  | 'planner'
  | 'journal'
  | 'tools'
  | 'goals'
  | 'settings';
