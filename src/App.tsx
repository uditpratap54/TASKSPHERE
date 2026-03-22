import { FilterBar } from './components/FilterBar';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';
import { PresenceOverlay } from './components/PresenceOverlay';
import { TimelineView } from './components/TimelineView';
import { ViewTabs } from './components/ViewTabs';
import { TaskProvider, useTaskBoard } from './state/TaskContext';
import styles from './App.module.css';

function BoardContent() {
  const { collaborators, filteredTasks, tasks, view } = useTaskBoard();
  const activeEditors = collaborators.filter((user) => user.mode === 'editing').length;
  const hiddenCount = tasks.length - filteredTasks.length;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>TaskSphere</span>
            <h1 className={styles.title}>A project tracker that keeps the same work visible in three useful ways.</h1>
            <p className={styles.subtitle}>
              I kept the interaction model simple on purpose: one shared task dataset, instant view switching,
              lightweight presence feedback, and custom drag behavior that does not depend on external UI helpers.
            </p>
          </div>
          <ViewTabs />
        </section>

        <FilterBar />

        <div className={styles.topBar}>
          <div className={styles.presenceBar}>
            <div className={styles.avatars}>
              {collaborators.map((collaborator) => (
                <span key={collaborator.id} className={styles.avatar} style={{ background: collaborator.color }}>
                  {collaborator.initials}
                </span>
              ))}
            </div>
            <div className={styles.label}>
              <strong>{collaborators.length} people are viewing this board</strong>
              <span>
                {activeEditors} active editor{activeEditors === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <div className={styles.summaryPill}>
            <strong>{filteredTasks.length}</strong>
            <span>
              task{filteredTasks.length === 1 ? '' : 's'} visible
              {hiddenCount > 0 ? ` · ${hiddenCount} hidden by filters` : ''}
            </span>
          </div>
        </div>

        <div className={styles.viewPort}>
          {view === 'kanban' ? <KanbanView /> : null}
          {view === 'list' ? <ListView /> : null}
          {view === 'timeline' ? <TimelineView /> : null}
        </div>
      </div>
      <PresenceOverlay />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <BoardContent />
    </TaskProvider>
  );
}
