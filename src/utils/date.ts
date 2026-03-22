const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function startOfDay(input: string | Date): Date {
  const date = input instanceof Date ? new Date(input) : new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(input: string | Date, amount: number): Date {
  const date = startOfDay(input);
  date.setDate(date.getDate() + amount);
  return date;
}

export function formatDateLabel(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(startOfDay(value));
}

export function formatMonthDay(value: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(value);
}

export function formatDueLabel(value: string): { label: string; tone: 'default' | 'today' | 'overdue' } {
  const target = startOfDay(value);
  const today = startOfDay(new Date());
  const diff = Math.round((target.getTime() - today.getTime()) / DAY_IN_MS);

  if (diff === 0) {
    return { label: 'Due Today', tone: 'today' };
  }

  if (diff < -7) {
    return {
      label: `${Math.abs(diff)} days overdue`,
      tone: 'overdue',
    };
  }

  if (diff < 0) {
    return {
      label: formatDateLabel(value),
      tone: 'overdue',
    };
  }

  return {
    label: formatDateLabel(value),
    tone: 'default',
  };
}

export function differenceInDays(start: string | Date, end: string | Date): number {
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / DAY_IN_MS);
}

export function isWithinRange(value: string, from: string, to: string): boolean {
  const current = startOfDay(value).getTime();
  if (from && current < startOfDay(from).getTime()) {
    return false;
  }
  if (to && current > startOfDay(to).getTime()) {
    return false;
  }
  return true;
}
