import { useEffect, useRef, useState } from 'react';
import { PRIORITY_LABELS, ROW_HEIGHT, STATUS_LABELS, VIRTUAL_BUFFER } from '../constants';
import { useTaskBoard } from '../state/TaskContext';
import { formatDueLabel } from '../utils/date';
import { nextSortDirection } from '../utils/format';
import type { SortKey, TaskStatus } from '../types';
import styles from './ListView.module.css';

export function ListView() {
  const { dispatch, registerAnchor, sort, sortedTasks, users } = useTaskBoard();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const viewportHeight = 580;
  const totalHeight = sortedTasks.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - VIRTUAL_BUFFER);
  const endIndex = Math.min(sortedTasks.length, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + VIRTUAL_BUFFER);
  const visibleTasks = sortedTasks.slice(startIndex, endIndex);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return undefined;
    }

    const handleScroll = () => setScrollTop(element.scrollTop);
    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  const requestSort = (key: SortKey) => {
    dispatch({
      type: 'set-sort',
      sort: {
        key,
        direction: nextSortDirection(key, sort.key, sort.direction),
      },
    });
  };

  if (!sortedTasks.length) {
    return (
      <div className={styles.frame}>
        <div className={styles.empty}>
          <div>
            <h3>No tasks match these filters</h3>
            <p>Try widening the date window or clearing filters to see the whole workload again.</p>
            <button className={styles.emptyButton} type="button" onClick={() => dispatch({ type: 'clear-filters' })}>
              Clear filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.frame}>
      <div className={styles.header}>
        <button
          className={`${styles.sortButton} ${sort.key === 'title' ? styles.sortActive : ''}`}
          type="button"
          onClick={() => requestSort('title')}
        >
          Title {sort.key === 'title' ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button
          className={`${styles.sortButton} ${sort.key === 'priority' ? styles.sortActive : ''}`}
          type="button"
          onClick={() => requestSort('priority')}
        >
          Priority {sort.key === 'priority' ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
        </button>
        <span>Assignee</span>
        <button
          className={`${styles.sortButton} ${sort.key === 'dueDate' ? styles.sortActive : ''}`}
          type="button"
          onClick={() => requestSort('dueDate')}
        >
          Due date {sort.key === 'dueDate' ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
        </button>
        <span>Status</span>
      </div>
      <div ref={viewportRef} className={styles.viewport}>
        <div className={styles.inner} style={{ height: totalHeight }}>
          {visibleTasks.map((task, index) => {
            const assignee = users.find((user) => user.id === task.assigneeId)!;
            const due = formatDueLabel(task.dueDate);
            return (
              <div
                key={task.id}
                className={styles.row}
                style={{
                  top: (startIndex + index) * ROW_HEIGHT,
                  height: ROW_HEIGHT,
                }}
              >
                <div>
                  <div className={styles.taskTitle}>{task.title}</div>
                  <div className={styles.muted}>#{task.id}</div>
                </div>
                <div className={styles.muted}>{PRIORITY_LABELS[task.priority]}</div>
                <div className={styles.muted}>{assignee.name}</div>
                <div className={styles.muted}>{due.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'space-between' }}>
                  <select
                    className={styles.statusSelect}
                    value={task.status}
                    onChange={(event) =>
                      dispatch({
                        type: 'set-status',
                        taskId: task.id,
                        status: event.target.value as TaskStatus,
                      })
                    }
                  >
                    {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                  <div ref={(element) => registerAnchor(task.id, element)} className={styles.presenceAnchor} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
