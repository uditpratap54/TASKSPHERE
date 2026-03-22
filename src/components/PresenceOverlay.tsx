import { useTaskBoard } from '../state/TaskContext';
import styles from './PresenceOverlay.module.css';

export function PresenceOverlay() {
  const { collaborators, getAnchorElement } = useTaskBoard();
  const offsets = new Map<string, number>();
  const positions = collaborators.reduce<Record<string, { left: number; top: number }>>((accumulator, collaborator) => {
    const anchor = getAnchorElement(collaborator.taskId);
    if (!anchor) {
      return accumulator;
    }

    const rect = anchor.getBoundingClientRect();
    const siblingCount = offsets.get(collaborator.taskId) ?? 0;
    offsets.set(collaborator.taskId, siblingCount + 1);
    accumulator[collaborator.id] = {
      left: rect.left + window.scrollX + siblingCount * 16,
      top: rect.top + window.scrollY,
    };
    return accumulator;
  }, {});

  return (
    <div className={styles.overlay} aria-hidden="true">
      {collaborators.map((collaborator) => {
        const position = positions[collaborator.id];
        if (!position) {
          return null;
        }

        return (
          <div
            key={collaborator.id}
            className={`${styles.avatar} ${collaborator.mode === 'editing' ? styles.editing : ''}`}
            style={{
              background: collaborator.color,
              left: `${position.left}px`,
              top: `${position.top}px`,
            }}
            title={`${collaborator.name} is ${collaborator.mode}`}
          >
            {collaborator.initials}
          </div>
        );
      })}
    </div>
  );
}
