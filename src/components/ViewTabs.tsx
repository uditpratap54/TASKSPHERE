import { VIEW_OPTIONS } from '../constants';
import { useTaskBoard } from '../state/TaskContext';
import styles from './ViewTabs.module.css';

export function ViewTabs() {
  const { dispatch, view } = useTaskBoard();

  return (
    <div className={styles.tabs}>
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.id}
          className={`${styles.tab} ${view === option.id ? styles.active : ''}`}
          type="button"
          onClick={() => dispatch({ type: 'set-view', view: option.id })}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
