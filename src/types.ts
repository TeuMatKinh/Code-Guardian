export interface User {
  id: number;
  email: string;
  language: 'en' | 'vi';
  theme: 'light' | 'dark';
  streak_count: number;
  last_active_date?: string;
}

export interface Progress {
  course_id: string;
  day_number: number;
}

export interface Day {
  day: number;
  title: string;
  content: string;
  example: string;
  task: string;
  expectedOutput: string;
}

export interface Course {
  id: string;
  name: string;
  days: Day[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  progress: Progress[];
  loading: boolean;
}
