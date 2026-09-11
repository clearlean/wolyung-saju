/**
 * 한국 시계 시각을 사주 계산에 쓸 수 있는 형태로 바꾼다.
 *
 * 두 단계가 필요하다.
 *
 * 1. 표준시 환원 — 한국의 표준시는 UTC+9로 고정된 적이 없다. 1954~1961년에는
 *    UTC+8:30을 썼고, 여러 해에 서머타임이 있었다. 사용자가 적어 낸 시각은 그
 *    당시의 시계 시각이므로 실제 UTC 순간으로 되돌려야 절기·일주가 맞는다.
 *
 * 2. 진태양시 보정 — UTC+9는 동경 135°를 기준으로 한다. 서울은 126.98°에 있어
 *    태양이 남중하는 시각이 표준시보다 약 32분 늦다. 사주는 태양의 위치로
 *    시간을 나누므로 시주와 일주 경계에 이 차이를 반영한다.
 *
 * 균시차(태양시와 평균태양시의 ±16분 차이)는 적용하지 않는다. 국내 만세력이
 * 대부분 경도 보정만 쓰기 때문에, 다른 곳에서 뽑은 사주와 어긋나지 않도록 맞췄다.
 */

/** 서울의 경도. 경도 1°는 태양 남중 시각으로 4분에 해당한다. */
const SEOUL_LONGITUDE = 126.978;

/** UTC+9 의 기준 경도. */
const STANDARD_MERIDIAN = 135;

/** 서울 기준 진태양시 보정. 약 -32분. */
export const TRUE_SOLAR_TIME_OFFSET_MINUTES =
  (SEOUL_LONGITUDE - STANDARD_MERIDIAN) * 4;

/** [년, 월(1-12), 일, 시, 분] 형태의 시계 시각. */
type ClockStamp = readonly [number, number, number, number, number];

type TimeSpan = {
  /** 구간 시작(포함). */
  from: ClockStamp;
  /** 구간 끝(미포함). */
  to: ClockStamp;
};

/** 표준시가 UTC+8:30 이던 구간. */
const HALF_HOUR_OFFSET_SPANS: readonly TimeSpan[] = [
  { from: [1908, 4, 1, 0, 0], to: [1912, 1, 1, 0, 0] },
  { from: [1954, 3, 21, 0, 0], to: [1961, 8, 10, 0, 0] },
];

/** 서머타임(+1시간) 구간. 시작·종료 모두 당시 시계 기준이다. */
const DAYLIGHT_SAVING_SPANS: readonly TimeSpan[] = [
  { from: [1948, 6, 1, 0, 0], to: [1948, 9, 13, 0, 0] },
  { from: [1949, 4, 3, 0, 0], to: [1949, 9, 11, 0, 0] },
  { from: [1950, 4, 1, 0, 0], to: [1950, 9, 10, 0, 0] },
  { from: [1951, 5, 6, 0, 0], to: [1951, 9, 9, 0, 0] },
  { from: [1955, 5, 5, 0, 0], to: [1955, 9, 9, 0, 0] },
  { from: [1956, 5, 20, 0, 0], to: [1956, 9, 30, 0, 0] },
  { from: [1957, 5, 5, 0, 0], to: [1957, 9, 22, 0, 0] },
  { from: [1958, 5, 4, 0, 0], to: [1958, 9, 21, 0, 0] },
  { from: [1959, 5, 3, 0, 0], to: [1959, 9, 20, 0, 0] },
  { from: [1960, 5, 1, 0, 0], to: [1960, 9, 18, 0, 0] },
  { from: [1987, 5, 10, 2, 0], to: [1987, 10, 11, 3, 0] },
  { from: [1988, 5, 8, 2, 0], to: [1988, 10, 9, 3, 0] },
];

export type BirthClockInput = {
  year: number;
  /** 1 ~ 12 */
  month: number;
  day: number;
  /** 시간을 모르면 호출부에서 정오(12:00)를 넣는다. */
  hour: number;
  minute: number;
};

/** 시계 시각을 비교 가능한 하나의 수로 편다. */
function toComparable(stamp: ClockStamp): number {
  const [year, month, day, hour, minute] = stamp;
  return ((year * 100 + month) * 100 + day) * 10_000 + hour * 100 + minute;
}

function isWithin(spans: readonly TimeSpan[], clock: BirthClockInput): boolean {
  const value = toComparable([
    clock.year,
    clock.month,
    clock.day,
    clock.hour,
    clock.minute,
  ]);

  return spans.some(
    (span) => value >= toComparable(span.from) && value < toComparable(span.to),
  );
}

/** 서머타임을 뺀 그 시점의 법정 표준시 오프셋(분). */
function standardOffsetMinutes(clock: BirthClockInput): number {
  return isWithin(HALF_HOUR_OFFSET_SPANS, clock) ? 8 * 60 + 30 : 9 * 60;
}

/** 그 시점에 서머타임으로 앞당겨져 있던 분. */
function daylightSavingMinutes(clock: BirthClockInput): number {
  return isWithin(DAYLIGHT_SAVING_SPANS, clock) ? 60 : 0;
}

/** 해당 시점에 한국 시계가 UTC보다 몇 분 앞서 있었는지. */
export function koreaUtcOffsetMinutes(clock: BirthClockInput): number {
  return standardOffsetMinutes(clock) + daylightSavingMinutes(clock);
}

/**
 * 한국 시계 시각을 실제 UTC 순간으로 되돌린다. 절기와 연·월주 판정에 쓴다.
 */
export function toUtcInstant(clock: BirthClockInput): Date {
  return new Date(
    Date.UTC(clock.year, clock.month - 1, clock.day, clock.hour, clock.minute) -
      koreaUtcOffsetMinutes(clock) * 60_000,
  );
}

/**
 * 진태양시로 환산한 시각. 일주 경계와 시지를 가르는 데 쓴다.
 *
 * 서머타임은 인위적인 시계 조작이므로 걷어 내고, 표준시 오프셋에 경도 보정만
 * 얹는다. 반환값은 편의를 위해 UTC 필드에 담은 "가상의 태양시"이므로,
 * 이 Date 를 다시 실제 시각으로 해석하면 안 된다.
 */
export function toTrueSolarClock(clock: BirthClockInput): Date {
  const shiftMinutes =
    standardOffsetMinutes(clock) + TRUE_SOLAR_TIME_OFFSET_MINUTES;

  return new Date(toUtcInstant(clock).getTime() + shiftMinutes * 60_000);
}
