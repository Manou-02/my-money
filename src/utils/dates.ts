export function formatDate(dateString: string, locale: string = 'fr'): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string, locale: string = 'fr'): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthRange(year: number, monthZeroIndexed: number): { start: string; end: string } {
  const start = new Date(year, monthZeroIndexed, 1);
  const end = new Date(year, monthZeroIndexed + 1, 0);

  const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;
  const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

  return { start: startStr, end: endStr };
}

export function isDateInPeriod(dateStr: string, period: 'all' | 'day' | 'week' | 'month'): boolean {
  if (period === 'all') return true;
  const target = new Date(dateStr);
  const now = new Date();

  if (period === 'day') {
    return (
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate()
    );
  }

  if (period === 'week') {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    return target >= oneWeekAgo && target <= now;
  }

  if (period === 'month') {
    return (
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth()
    );
  }

  return true;
}
