export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type ViewMode = 'kanban' | 'list' | 'timeline';

export type SortKey = 'title' | 'priority' | 'dueDate';

export type SortDirection = 'asc' | 'desc';

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  startDate: string | null;
  dueDate: string;
}

export interface Filters {
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  assigneeIds: string[];
  dueFrom: string;
  dueTo: string;
}

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export interface Collaborator {
  id: string;
  name: string;
  initials: string;
  color: string;
  taskId: string;
  mode: 'viewing' | 'editing';
}
