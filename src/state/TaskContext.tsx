/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ASSIGNEES, DEFAULT_SORT, EMPTY_FILTERS, PRIORITY_ORDER, STATUS_ORDER } from '../constants';
import { generateTasks } from '../data/generateTasks';
import { isWithinRange, startOfDay } from '../utils/date';
import { parseQueryValues } from '../utils/format';
import type {
  Collaborator,
  Filters,
  SortState,
  Task,
  TaskPriority,
  TaskStatus,
  User,
  ViewMode,
} from '../types';

interface TaskState {
  tasks: Task[];
  view: ViewMode;
  filters: Filters;
  sort: SortState;
}

type TaskAction =
  | { type: 'set-view'; view: ViewMode }
  | { type: 'set-filters'; filters: Filters }
  | { type: 'clear-filters' }
  | { type: 'set-sort'; sort: SortState }
  | { type: 'set-status'; taskId: string; status: TaskStatus }
  | { type: 'hydrate-url'; payload: Pick<TaskState, 'view' | 'filters' | 'sort'> };

interface TaskContextValue extends TaskState {
  users: User[];
  filteredTasks: Task[];
  sortedTasks: Task[];
  dispatch: React.Dispatch<TaskAction>;
  collaborators: Collaborator[];
  presenceVersion: number;
  registerAnchor: (taskId: string, element: HTMLElement | null) => void;
  getAnchorElement: (taskId: string) => HTMLElement | undefined;
}

const allTasks = generateTasks();

function parseUrlState(): Pick<TaskState, 'view' | 'filters' | 'sort'> {
  const params = new URLSearchParams(window.location.search);
  const statuses = parseQueryValues(params.get('status')).filter((status): status is TaskStatus =>
    STATUS_ORDER.includes(status as TaskStatus),
  );
  const priorities = parseQueryValues(params.get('priority')).filter((priority): priority is TaskPriority =>
    PRIORITY_ORDER.includes(priority as TaskPriority),
  );
  const assigneeIds = parseQueryValues(params.get('assignee')).filter((id) => ASSIGNEES.some((user) => user.id === id));
  const view = params.get('view');
  const sortKey = params.get('sort');
  const direction = params.get('dir');

  return {
    view: view === 'list' || view === 'timeline' ? view : 'kanban',
    filters: {
      statuses,
      priorities,
      assigneeIds,
      dueFrom: params.get('from') ?? '',
      dueTo: params.get('to') ?? '',
    },
    sort: {
      key: sortKey === 'title' || sortKey === 'priority' ? sortKey : 'dueDate',
      direction: direction === 'desc' ? 'desc' : 'asc',
    },
  };
}

function reducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'set-view':
      return { ...state, view: action.view };
    case 'set-filters':
      return { ...state, filters: action.filters };
    case 'clear-filters':
      return { ...state, filters: EMPTY_FILTERS };
    case 'set-sort':
      return { ...state, sort: action.sort };
    case 'set-status':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? {
                ...task,
                status: action.status,
              }
            : task,
        ),
      };
    case 'hydrate-url':
      return {
        ...state,
        view: action.payload.view,
        filters: action.payload.filters,
        sort: action.payload.sort,
      };
    default:
      return state;
  }
}

function serializeUrlState(state: Pick<TaskState, 'view' | 'filters' | 'sort'>): string {
  const params = new URLSearchParams();
  if (state.view !== 'kanban') {
    params.set('view', state.view);
  }
  if (state.filters.statuses.length) {
    params.set('status', state.filters.statuses.join(','));
  }
  if (state.filters.priorities.length) {
    params.set('priority', state.filters.priorities.join(','));
  }
  if (state.filters.assigneeIds.length) {
    params.set('assignee', state.filters.assigneeIds.join(','));
  }
  if (state.filters.dueFrom) {
    params.set('from', state.filters.dueFrom);
  }
  if (state.filters.dueTo) {
    params.set('to', state.filters.dueTo);
  }
  if (state.sort.key !== DEFAULT_SORT.key) {
    params.set('sort', state.sort.key);
  }
  if (state.sort.direction !== DEFAULT_SORT.direction) {
    params.set('dir', state.sort.direction);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

const initialUrlState = typeof window === 'undefined' ? null : parseUrlState();

const TaskContext = createContext<TaskContextValue | null>(null);

const collaboratorPool = [
  { id: 'c1', name: 'Neha', initials: 'NE', color: '#D62828' },
  { id: 'c2', name: 'Yash', initials: 'YA', color: '#1D3557' },
  { id: 'c3', name: 'Ira', initials: 'IR', color: '#2A9D8F' },
  { id: 'c4', name: 'Sam', initials: 'SA', color: '#8D5A97' },
];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    tasks: allTasks,
    view: initialUrlState?.view ?? 'kanban',
    filters: initialUrlState?.filters ?? EMPTY_FILTERS,
    sort: initialUrlState?.sort ?? DEFAULT_SORT,
  });
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() =>
    collaboratorPool.slice(0, 3).map((user, index) => ({
      ...user,
      taskId: allTasks[index * 7].id,
      mode: index % 2 === 0 ? 'viewing' : 'editing',
    })),
  );
  const [presenceVersion, setPresenceVersion] = useState(0);
  const anchorMapRef = useRef(new Map<string, HTMLElement>());
  const ignoreNextHistoryRef = useRef(false);

  useEffect(() => {
    const query = serializeUrlState({
      view: state.view,
      filters: state.filters,
      sort: state.sort,
    });
    const nextUrl = `${window.location.pathname}${query}`;
    if (ignoreNextHistoryRef.current) {
      ignoreNextHistoryRef.current = false;
      window.history.replaceState(null, '', nextUrl);
      return;
    }
    window.history.pushState(null, '', nextUrl);
  }, [state.filters, state.sort, state.view]);

  useEffect(() => {
    const handlePopState = () => {
      ignoreNextHistoryRef.current = true;
      dispatch({ type: 'hydrate-url', payload: parseUrlState() });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCollaborators((current) => {
        const activeCount = 2 + Math.floor(Math.random() * 3);
        return collaboratorPool.slice(0, activeCount).map((user) => {
          const existing = current.find((item) => item.id === user.id);
          const randomTask = allTasks[Math.floor(Math.random() * allTasks.length)];
          const keepTask = existing && Math.random() > 0.45 ? existing.taskId : randomTask.id;
          return {
            ...user,
            taskId: keepTask,
            mode: Math.random() > 0.72 ? 'editing' : 'viewing',
          };
        });
      });
      setPresenceVersion((version) => version + 1);
    }, 2200);

    return () => window.clearInterval(interval);
  }, []);

  const filteredTasks = state.tasks.filter((task) => {
    if (state.filters.statuses.length && !state.filters.statuses.includes(task.status)) {
      return false;
    }
    if (state.filters.priorities.length && !state.filters.priorities.includes(task.priority)) {
      return false;
    }
    if (state.filters.assigneeIds.length && !state.filters.assigneeIds.includes(task.assigneeId)) {
      return false;
    }
    if (!isWithinRange(task.dueDate, state.filters.dueFrom, state.filters.dueTo)) {
      return false;
    }
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((left, right) => {
    if (state.sort.key === 'title') {
      const value = left.title.localeCompare(right.title);
      return state.sort.direction === 'asc' ? value : value * -1;
    }
    if (state.sort.key === 'priority') {
      const value = PRIORITY_ORDER.indexOf(left.priority) - PRIORITY_ORDER.indexOf(right.priority);
      return state.sort.direction === 'asc' ? value : value * -1;
    }
    const value = startOfDay(left.dueDate).getTime() - startOfDay(right.dueDate).getTime();
    return state.sort.direction === 'asc' ? value : value * -1;
  });

  const value = useMemo<TaskContextValue>(
    () => ({
      ...state,
      users: ASSIGNEES,
      filteredTasks,
      sortedTasks,
      dispatch,
      collaborators,
      presenceVersion,
      registerAnchor: (taskId, element) => {
        if (!element) {
          anchorMapRef.current.delete(taskId);
          return;
        }
        anchorMapRef.current.set(taskId, element);
      },
      getAnchorElement: (taskId) => anchorMapRef.current.get(taskId),
    }),
    [collaborators, filteredTasks, presenceVersion, sortedTasks, state],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskBoard() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskBoard must be used inside TaskProvider');
  }
  return context;
}
