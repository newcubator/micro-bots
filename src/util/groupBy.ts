type KeySelector<T> = (item: T) => string;

export function groupBy<T>(items: T[], keySelector: KeySelector<T>): Record<string, T[]> {
  return items.reduce((result, item) => {
    const key = keySelector(item);
    (result[key] = result[key] || []).push(item);
    return result;
  }, {} as Record<string, T[]>);
}
