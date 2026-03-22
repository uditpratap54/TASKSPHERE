import { useEffect, useMemo, useRef, useState } from 'react';
import { STATUS_LABELS, STATUS_ORDER } from '../constants';
import { useTaskBoard } from '../state/TaskContext';
import type { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import styles from './KanbanView.module.css';

interface DragState {
  task: Task;
  originRect: DOMRect;
  offsetX: number;
  offsetY: number;
  positionX: number;
  positionY: number;
  hoveredStatus: TaskStatus | null;
  snapBack: boolean;
}

export function KanbanView() {
  const { dispatch, filteredTasks } = useTaskBoard();
  const [dragState, setDragState] = useState<DragState | null>(null);
  const columnRefs = useRef<Record<TaskStatus, HTMLElement | null>>({
    todo: null,
    'in-progress': null,
    'in-review': null,
    done: null,
  });

  const taskGroups = useMemo(
    () =>
      STATUS_ORDER.reduce<Record<TaskStatus, Task[]>>(
        (accumulator, status) => ({
          ...accumulator,
          [status]: filteredTasks.filter((task) => task.status === status),
        }),
        {
          todo: [],
          'in-progress': [],
          'in-review': [],
          done: [],
        },
      ),
    [filteredTasks],
  );

  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const handleMove = (event: PointerEvent) => {
      setDragState((current) => {
        if (!current) {
          return current;
        }
        const hoveredStatus =
          STATUS_ORDER.find((status) => {
            const rect = columnRefs.current[status]?.getBoundingClientRect();
            if (!rect) {
              return false;
            }
            return (
              event.clientX >= rect.left &&
              event.clientX <= rect.right &&
              event.clientY >= rect.top &&
              event.clientY <= rect.bottom
            );
          }) ?? null;

        return {
          ...current,
          hoveredStatus,
          positionX: event.clientX - current.offsetX,
          positionY: event.clientY - current.offsetY,
          snapBack: false,
        };
      });
    };

    const handleUp = () => {
      setDragState((current) => {
        if (!current) {
          return current;
        }
        if (current.hoveredStatus) {
          dispatch({ type: 'set-status', taskId: current.task.id, status: current.hoveredStatus });
          return null;
        }

        window.setTimeout(() => setDragState(null), 180);
        return {
          ...current,
          positionX: current.originRect.left,
          positionY: current.originRect.top,
          snapBack: true,
        };
      });
    };

    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return () => {
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dispatch, dragState]);

  const beginDrag = (task: Task, event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setDragState({
      task,
      originRect: rect,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      positionX: rect.left,
      positionY: rect.top,
      hoveredStatus: task.status,
      snapBack: false,
    });
  };

  return (
    <>
      <div className={styles.board}>
        {STATUS_ORDER.map((status) => {
          const columnTasks = taskGroups[status];
          const isActiveDrop = dragState?.hoveredStatus === status;
          return (
            <section
              key={status}
              ref={(element) => {
                columnRefs.current[status] = element;
              }}
              className={`${styles.column} ${isActiveDrop ? styles.columnActive : ''}`}
            >
              <header className={styles.header}>
                <span className={styles.title}>{STATUS_LABELS[status]}</span>
                <span className={styles.count}>{columnTasks.length}</span>
              </header>
              <div className={styles.cards}>
                {columnTasks.length === 0 ? (
                  <div className={styles.empty}>
                    <div>
                      <strong>No tasks here yet</strong>
                      <p>Drop a card into {STATUS_LABELS[status]} or relax this filter set.</p>
                    </div>
                  </div>
                ) : null}
                {columnTasks.map((task) => {
                  const isDragging = dragState?.task.id === task.id;
                  return (
                    <div key={task.id}>
                      {isDragging ? (
                        <div className={styles.placeholder} style={{ height: dragState.originRect.height }} />
                      ) : (
                        <TaskCard task={task} onPointerDown={beginDrag} />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      {dragState ? (
        <div
          className={styles.dragGhost}
          style={{
            left: dragState.positionX,
            top: dragState.positionY,
            transition: dragState.snapBack ? 'left 180ms ease, top 180ms ease' : undefined,
          }}
        >
          <TaskCard task={dragState.task} />
        </div>
      ) : null}
    </>
  );
}
