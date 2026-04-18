export function calculateTimeBetween(first: string, second: string) {
  const date1 = new Date(first);
  const date2 = new Date(second);

  const diff = date2.getTime() - date1.getTime();

  return Math.round(diff / (24 * 60 * 60 * 60));
}
