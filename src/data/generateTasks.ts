import { ASSIGNEES, PRIORITY_ORDER, STATUS_ORDER } from '../constants';
import { addDays } from '../utils/date';
import type { Task } from '../types';

function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const adjectives = ['Client', 'Sprint', 'Growth', 'Payment', 'Search', 'Dashboard', 'Workspace', 'Analytics', 'Release', 'Support'];
const nouns = ['Cleanup', 'Review', 'Polish', 'Migration', 'Audit', 'Sync', 'Plan', 'Prototype', 'Rollout', 'Workflow'];
const suffixes = [
  'for beta launch',
  'with mobile parity',
  'before stakeholder demo',
  'for enterprise accounts',
  'after QA feedback',
  'with accessibility pass',
  'for onboarding flow',
  'for reporting module',
  'with dashboard refresh',
  'before sprint close',
];

export function generateTasks(total = 560): Task[] {
  const random = createRandom(42);
  const baseDate = new Date();
  const tasks: Task[] = [];

  for (let index = 0; index < total; index += 1) {
    const status = STATUS_ORDER[Math.floor(random() * STATUS_ORDER.length)];
    const priority = PRIORITY_ORDER[Math.floor(random() * PRIORITY_ORDER.length)];
    const assignee = ASSIGNEES[Math.floor(random() * ASSIGNEES.length)];
    const offsetStart = Math.floor(random() * 35) - 14;
    const duration = Math.floor(random() * 12) + 1;
    const hasStartDate = random() > 0.16;
    const dueDate = addDays(baseDate, offsetStart + duration);
    const startDate = hasStartDate ? addDays(baseDate, offsetStart) : null;

    tasks.push({
      id: `task-${index + 1}`,
      title: `${adjectives[index % adjectives.length]} ${nouns[Math.floor(random() * nouns.length)]} ${suffixes[index % suffixes.length]}`,
      assigneeId: assignee.id,
      priority,
      status,
      startDate: startDate ? startDate.toISOString() : null,
      dueDate: dueDate.toISOString(),
    });
  }

  return tasks;
}
