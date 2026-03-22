import { PRIORITY_LABELS } from '../constants';
import { useTaskBoard } from '../state/TaskContext';
import { formatDueLabel } from '../utils/date';
import type { Task } from '../types';
import styles from './TaskCard.module.css';

const priorityColors = {
  critical: { background: 'rgba(196, 69, 54, 0.14)', color: '#B42318' },
  high: { background: 'rgba(247, 127, 0, 0.14)', color: '#BC6C25' },
  medium: { background: 'rgba(23, 104, 172, 0.14)', color: '#1768AC' },
  low: { background: 'rgba(79, 119, 45, 0.14)', color: '#4F772D' },
};

interface TaskCardProps {
  task: Task;
  onPointerDown?: (task: Task, event: React.PointerEvent<HTMLDivElement>) => void;
}

export function TaskCard({ task, onPointerDown }: TaskCardProps) {
  const { collaborators, registerAnchor, users } = useTaskBoard();
  const assignee = users.find((user) => user.id === task.assigneeId)!;
  const due = formatDueLabel(task.dueDate);
  const watchers = collaborators.filter((collaborator) => collaborator.taskId === task.id);

  return (
    <div
      className={styles.card}
      onPointerDown={onPointerDown ? (event) => onPointerDown(task, event) : undefined}
    >
      <div ref={(element) => registerAnchor(task.id, element)} className={styles.presenceAnchor} />
      {watchers.length > 1 ? (
        <div className={styles.stack}>
          {watchers.slice(0, 2).map((watcher) => (
            <span key={watcher.id} className={styles.stackAvatar} style={{ background: watcher.color }}>
              {watcher.initials}
            </span>
          ))}
          {watchers.length > 2 ? <span className={styles.overflow}>+{watchers.length - 2}</span> : null}
        </div>
      ) : null}
      <div className={styles.topRow}>
        <h3 className={styles.title}>{task.title}</h3>
        <span className={styles.badge} style={priorityColors[task.priority]}>
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>
      <div className={styles.meta}>
        <div className={styles.assignee}>
          <span className={styles.avatar} style={{ background: assignee.color }}>
            {assignee.initials}
          </span>
          <span>{assignee.name}</span>
        </div>
        <div
          className={`${styles.due} ${due.tone === 'today' ? styles.today : ''} ${due.tone === 'overdue' ? styles.overdue : ''}`}
        >
          {due.label}
        </div>
      </div>
    </div>
  );
}
