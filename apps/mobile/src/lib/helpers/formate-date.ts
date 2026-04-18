export function formateDate(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDay();
  const hours = date.getHours();
  const minuts = date.getMinutes();
  const seconds = date.getSeconds();

  return { year, month, day, hours, minuts, seconds };
}

export function formateDateToText(date: Date) {
  let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  let month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
  let hours = new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(date);
  let minuts = new Intl.DateTimeFormat('en', { minute: 'numeric' }).format(
    date,
  );

  return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${String(year).padStart(2, '0')} T ${String(hours).padStart(2, '0')}:${String(minuts).padStart(2, '0')}`;
}

export function dateToTime(date: Date) {
  const { hours, minuts } = formateDate(date);
  return `${hours.toString().padStart(2, '0')}:${minuts
    .toString()
    .padStart(2, '0')}`;
}
