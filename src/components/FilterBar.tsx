import { useEffect, useRef, useState } from 'react';
import { PRIORITY_LABELS, STATUS_LABELS } from '../constants';
import { useTaskBoard } from '../state/TaskContext';
import type { Filters, TaskPriority, TaskStatus } from '../types';
import styles from './FilterBar.module.css';

type FilterMenuId = 'status' | 'priority' | 'assignee' | null;

function hasActiveFilters(filters: Filters) {
  return (
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assigneeIds.length > 0 ||
    Boolean(filters.dueFrom) ||
    Boolean(filters.dueTo)
  );
}

export function FilterBar() {
  const { filters, dispatch, users } = useTaskBoard();
  const [openMenu, setOpenMenu] = useState<FilterMenuId>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const updateFilters = (nextFilters: Filters) => dispatch({ type: 'set-filters', filters: nextFilters });

  const toggleStatus = (status: TaskStatus) => {
    const statuses = filters.statuses.includes(status)
      ? filters.statuses.filter((value) => value !== status)
      : [...filters.statuses, status];
    updateFilters({ ...filters, statuses });
  };

  const togglePriority = (priority: TaskPriority) => {
    const priorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((value) => value !== priority)
      : [...filters.priorities, priority];
    updateFilters({ ...filters, priorities });
  };

  const toggleAssignee = (assigneeId: string) => {
    const assigneeIds = filters.assigneeIds.includes(assigneeId)
      ? filters.assigneeIds.filter((value) => value !== assigneeId)
      : [...filters.assigneeIds, assigneeId];
    updateFilters({ ...filters, assigneeIds });
  };

  const renderMenu = (menuId: FilterMenuId) => {
    if (openMenu !== menuId) {
      return null;
    }

    if (menuId === 'status') {
      return (
        <div className={styles.menu}>
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
            <label key={status} className={styles.option}>
              <input
                checked={filters.statuses.includes(status)}
                className={styles.checkbox}
                type="checkbox"
                onChange={() => toggleStatus(status)}
              />
              <span className={styles.label}>{STATUS_LABELS[status]}</span>
            </label>
          ))}
        </div>
      );
    }

    if (menuId === 'priority') {
      return (
        <div className={styles.menu}>
          {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((priority) => (
            <label key={priority} className={styles.option}>
              <input
                checked={filters.priorities.includes(priority)}
                className={styles.checkbox}
                type="checkbox"
                onChange={() => togglePriority(priority)}
              />
              <span className={styles.label}>{PRIORITY_LABELS[priority]}</span>
            </label>
          ))}
        </div>
      );
    }

    if (menuId === 'assignee') {
      return (
        <div className={styles.menu}>
          {users.map((user) => (
            <label key={user.id} className={styles.option}>
              <input
                checked={filters.assigneeIds.includes(user.id)}
                className={styles.checkbox}
                type="checkbox"
                onChange={() => toggleAssignee(user.id)}
              />
              <span className={styles.label}>{user.name}</span>
            </label>
          ))}
        </div>
      );
    }

    return null;
  };

  const active = hasActiveFilters(filters);

  return (
    <div ref={rootRef} className={styles.bar}>
      <div className={styles.group}>
        <div className={styles.menuShell}>
          <button
            className={`${styles.trigger} ${filters.statuses.length ? styles.triggerActive : ''}`}
            type="button"
            onClick={() => setOpenMenu((current) => (current === 'status' ? null : 'status'))}
          >
            Status
            <span>{filters.statuses.length ? `${filters.statuses.length} selected` : 'Any'}</span>
          </button>
          {renderMenu('status')}
        </div>
        <div className={styles.menuShell}>
          <button
            className={`${styles.trigger} ${filters.priorities.length ? styles.triggerActive : ''}`}
            type="button"
            onClick={() => setOpenMenu((current) => (current === 'priority' ? null : 'priority'))}
          >
            Priority
            <span>{filters.priorities.length ? `${filters.priorities.length} selected` : 'Any'}</span>
          </button>
          {renderMenu('priority')}
        </div>
        <div className={styles.menuShell}>
          <button
            className={`${styles.trigger} ${filters.assigneeIds.length ? styles.triggerActive : ''}`}
            type="button"
            onClick={() => setOpenMenu((current) => (current === 'assignee' ? null : 'assignee'))}
          >
            Assignee
            <span>{filters.assigneeIds.length ? `${filters.assigneeIds.length} selected` : 'Anyone'}</span>
          </button>
          {renderMenu('assignee')}
        </div>
        <div className={styles.dateInputs}>
          <input
            className={styles.dateField}
            type="date"
            value={filters.dueFrom}
            onChange={(event) => updateFilters({ ...filters, dueFrom: event.target.value })}
          />
          <input
            className={styles.dateField}
            type="date"
            value={filters.dueTo}
            onChange={(event) => updateFilters({ ...filters, dueTo: event.target.value })}
          />
        </div>
      </div>
      {active ? (
        <button className={styles.clearButton} type="button" onClick={() => dispatch({ type: 'clear-filters' })}>
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
