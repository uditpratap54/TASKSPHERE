import { PRIORITY_LABELS } from '../constants';
import { useTaskBoard } from '../state/TaskContext';
import { addDays, differenceInDays, formatMonthDay, startOfDay } from '../utils/date';
import styles from './TimelineView.module.css';

const priorityColors = {
  critical: '#C44536',
  high: '#F77F00',
  medium: '#1768AC',
  low: '#4F772D',
};

const dayWidth = 44;

export function TimelineView() {
  const { filteredTasks, registerAnchor } = useTaskBoard();

  if (!filteredTasks.length) {
    return (
      <div className={styles.shell}>
        <div className={styles.empty} style={{ gridColumn: '1 / -1' }}>
          <div>
            <h3>No tasks to plot this month</h3>
            <p>Adjust your filters to bring tasks back onto the timeline.</p>
          </div>
        </div>
      </div>
    );
  }

  const today = startOfDay(new Date());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const totalDays = monthEnd.getDate();
  const todayOffset = differenceInDays(monthStart, today) * dayWidth;

  return (
    <div className={styles.shell}>
      <div className={styles.sidebar}>
        <div className={styles.nameCell}>Task</div>
        {filteredTasks.map((task) => (
          <div key={task.id} className={styles.nameCell}>
            {task.title}
          </div>
        ))}
      </div>
      <div className={styles.timelineWrap}>
        <div className={styles.grid} style={{ width: totalDays * dayWidth }}>
          <div className={styles.header}>
            {Array.from({ length: totalDays }).map((_, index) => (
              <div key={index} className={styles.day}>
                {formatMonthDay(addDays(monthStart, index))}
              </div>
            ))}
          </div>
          <div className={styles.todayLine} style={{ left: todayOffset }}>
            <div className={styles.todayDot} />
          </div>
          {filteredTasks.map((task) => {
            const start = task.startDate ? startOfDay(task.startDate) : startOfDay(task.dueDate);
            const due = startOfDay(task.dueDate);
            const startOffset = Math.max(0, differenceInDays(monthStart, start));
            const span = Math.max(1, differenceInDays(start, due) + 1);

            return (
              <div key={task.id} className={styles.row}>
                <div
                  className={`${styles.bar} ${task.startDate ? '' : styles.marker}`}
                  style={{
                    left: startOffset * dayWidth + 8,
                    width: task.startDate ? Math.max(dayWidth - 12, span * dayWidth - 16) : 20,
                    background: priorityColors[task.priority],
                  }}
                  title={`${PRIORITY_LABELS[task.priority]} priority`}
                >
                  {task.startDate ? PRIORITY_LABELS[task.priority] : ''}
                </div>
                <div ref={(element) => registerAnchor(task.id, element)} className={styles.presenceAnchor} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
