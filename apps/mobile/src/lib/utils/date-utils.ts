export function generateJoinAndLeaveDates() {
  const now = new Date();
  const joinDate = now.toISOString();

  const leaveDate = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

  return { joinDate, leaveDate };
}

export function formatLocalDate(dateArr: [number, number, number]) {
  if (!dateArr) return '';
  const [y, m, d] = dateArr;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
