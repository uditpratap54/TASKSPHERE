import { PRIORITY_LABELS, STATUS_LABELS } from '../constants';
import type { SortDirection, SortKey, TaskPriority, TaskStatus } from '../types';

export function statusLabel(status: TaskStatus): string {
  return STATUS_LABELS[status];
}

export function priorityLabel(priority: TaskPriority): string {
  return PRIORITY_LABELS[priority];
}

export function nextSortDirection(currentKey: SortKey, activeKey: SortKey, direction: SortDirection): SortDirection {
  if (currentKey !== activeKey) {
    return 'asc';
  }
  return direction === 'asc' ? 'desc' : 'asc';
}

export function parseQueryValues(value: string | null): string[] {
  if (!value) {
    return [];
  }
  return value.split(',').filter(Boolean);
}
