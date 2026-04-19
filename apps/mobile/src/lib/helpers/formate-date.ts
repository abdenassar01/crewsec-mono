export function formateDate(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return { year, month, day, hours, minutes, seconds };
}

export function formateDateToText(date: Date) {
  const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
  const hours = new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(date);
  const minutes = new Intl.DateTimeFormat('en', { minute: 'numeric' }).format(date);

  return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${String(year).padStart(2, '0')} T ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function dateToTime(date: Date) {
  const { hours, minutes } = formateDate(date);
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
}
