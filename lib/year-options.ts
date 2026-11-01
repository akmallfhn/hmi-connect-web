export const EARLIEST_PROFILE_YEAR = 1990;
// An expected graduation can sit a few years ahead; ten covers a doctorate started this year.
const GRADUATION_YEARS_AHEAD = 10;

export function currentYear(): number {
  return new Date().getFullYear();
}

// Years from `from` to `to` inclusive, newest first so recent years need no scrolling.
export function yearRange(from: number, to: number): number[] {
  const years: number[] = [];
  for (let year = to; year >= from; year--) years.push(year);
  return years;
}

export function pastYears(): number[] {
  return yearRange(EARLIEST_PROFILE_YEAR, currentYear());
}

export function graduationYears(): number[] {
  return yearRange(EARLIEST_PROFILE_YEAR, currentYear() + GRADUATION_YEARS_AHEAD);
}
