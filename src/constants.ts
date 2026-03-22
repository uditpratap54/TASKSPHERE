import type { Filters, SortState, TaskPriority, TaskStatus, User, ViewMode } from './types';

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in-progress', 'in-review', 'done'];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  done: 'Done',
};

export const PRIORITY_ORDER: TaskPriority[] = ['critical', 'high', 'medium', 'low'];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const VIEW_OPTIONS: { id: ViewMode; label: string }[] = [
  { id: 'kanban', label: 'Kanban' },
  { id: 'list', label: 'List' },
  { id: 'timeline', label: 'Timeline' },
];

export const ASSIGNEES: User[] = [
  { id: 'u1', name: 'Aarav Sharma', initials: 'AS', color: '#1768AC' },
  { id: 'u2', name: 'Meera Nair', initials: 'MN', color: '#4F772D' },
  { id: 'u3', name: 'Kabir Khan', initials: 'KK', color: '#C44536' },
  { id: 'u4', name: 'Riya Patel', initials: 'RP', color: '#7B2CBF' },
  { id: 'u5', name: 'Dev Malhotra', initials: 'DM', color: '#F77F00' },
  { id: 'u6', name: 'Anaya Joshi', initials: 'AJ', color: '#0081A7' },
];

export const EMPTY_FILTERS: Filters = {
  statuses: [],
  priorities: [],
  assigneeIds: [],
  dueFrom: '',
  dueTo: '',
};

export const DEFAULT_SORT: SortState = {
  key: 'dueDate',
  direction: 'asc',
};

export const ROW_HEIGHT = 64;
export const VIRTUAL_BUFFER = 5;
