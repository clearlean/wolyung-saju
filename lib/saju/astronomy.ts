/**
 * 절기 판정을 위한 태양 위치 계산.
 *
 * 사주의 연주와 월주는 달력의 월이 아니라 절기로 나뉜다. 절기는 태양의 황경이
 * 15° 배수를 지나는 순간이므로, 출생 순간의 태양 황경만 알면 월지가 곧바로 나온다.
 *
 * 알고리즘은 Meeus, *Astronomical Algorithms* 2판 25장의 저정밀 태양 위치 공식이다.
 * 황경 오차는 약 0.01°로, 시간으로 환산하면 절기 경계에서 ±15분 수준이다.
 * 절기 경계에 15분 이내로 붙어서 태어난 경우가 아니면 결과에 영향이 없다.
 */

/** 1970-01-01T00:00:00Z 의 율리우스일. */
const UNIX_EPOCH_JD = 2440587.5;

const DEGREES_TO_RADIANS = Math.PI / 180;

export function toJulianDay(date: Date): number {
  return date.getTime() / 86_400_000 + UNIX_EPOCH_JD;
}

export function fromJulianDay(julianDay: number): Date {
  return new Date((julianDay - UNIX_EPOCH_JD) * 86_400_000);
}

/** 자정(00:00 UT)에 시작하는 정수 율리우스일. 60갑자 일주 계산에 쓴다. */
export function toJulianDayNumber(julianDay: number): number {
  return Math.floor(julianDay + 0.5);
}

function sinDegrees(degrees: number): number {
  return Math.sin(degrees * DEGREES_TO_RADIANS);
}

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

/** -180 ~ +180 범위로 접은 각도 차이. */
function signedDegrees(degrees: number): number {
  const wrapped = normalizeDegrees(degrees);
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

/**
 * ΔT(TT − UT): 지구 자전이 고르지 않아 생기는 역학시와 세계시의 차이. 단위는 초.
 *
 * Espenak & Meeus 의 구간별 다항식이다. 현재 값은 약 70초로 절기 시각을 1분 남짓
 * 움직이므로, 황경 계산 오차와 같은 자릿수를 맞추기 위해 함께 반영한다.
 */
export function deltaTSeconds(year: number): number {
  if (year < 1900) {
    const t = year - 1860;
    return (
      7.62 +
      0.5737 * t -
      0.251754 * t ** 2 +
      0.01680668 * t ** 3 -
      0.0004473624 * t ** 4 +
      t ** 5 / 233_174
    );
  }

  if (year < 1920) {
    const t = year - 1900;
    return (
      -2.79 +
      1.494119 * t -
      0.0598939 * t ** 2 +
      0.0061966 * t ** 3 -
      0.000197 * t ** 4
    );
  }

  if (year < 1941) {
    const t = year - 1920;
    return 21.2 + 0.84493 * t - 0.0761 * t ** 2 + 0.0020936 * t ** 3;
  }

  if (year < 1961) {
    const t = year - 1950;
    return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547;
  }

  if (year < 1986) {
    const t = year - 1975;
    return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718;
  }

  if (year < 2005) {
    const t = year - 2000;
    return (
      63.86 +
      0.3345 * t -
      0.060374 * t ** 2 +
      0.0017275 * t ** 3 +
      0.000651814 * t ** 4 +
      0.00002373599 * t ** 5
    );
  }

  if (year < 2050) {
    const t = year - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t ** 2;
  }

  return -20 + 32 * ((year - 1820) / 100) ** 2 - 0.5628 * (2150 - year);
}

function approximateYear(julianDay: number): number {
  return 2000 + (julianDay - 2_451_545) / 365.25;
}

/**
 * 역학시(TT) 기준 태양의 겉보기 황경. 단위는 도(0 ~ 360).
 */
function apparentSolarLongitudeTT(julianDayTT: number): number {
  const t = (julianDayTT - 2_451_545) / 36_525;

  // 기하 평균 황경
  const meanLongitude = 280.46646 + 36_000.76983 * t + 0.0003032 * t ** 2;
  // 평균 근점 이각
  const meanAnomaly = 357.52911 + 35_999.05029 * t - 0.0001537 * t ** 2;

  // 중심차
  const equationOfCenter =
    (1.914602 - 0.004817 * t - 0.000014 * t ** 2) * sinDegrees(meanAnomaly) +
    (0.019993 - 0.000101 * t) * sinDegrees(2 * meanAnomaly) +
    0.000289 * sinDegrees(3 * meanAnomaly);

  const trueLongitude = meanLongitude + equationOfCenter;

  // 달 승교점의 황경. 장동과 광행차 보정에 쓴다.
  const ascendingNode = 125.04 - 1934.136 * t;

  return normalizeDegrees(
    trueLongitude - 0.00569 - 0.00478 * sinDegrees(ascendingNode),
  );
}

/**
 * 세계시(UT) 기준 율리우스일에서의 태양 겉보기 황경.
 */
export function solarLongitude(julianDayUT: number): number {
  const deltaTDays = deltaTSeconds(approximateYear(julianDayUT)) / 86_400;
  return apparentSolarLongitudeTT(julianDayUT + deltaTDays);
}

/**
 * 태양 황경이 `targetLongitude` 가 되는 순간을 찾는다.
 *
 * 태양은 하루에 약 1° 움직이므로 황경 차이를 날짜로 환산해 밀어 넣는 뉴턴법이
 * 몇 번 만에 수렴한다. `nearJulianDay` 는 해당 절기에서 한 달 이내면 충분하다.
 */
export function findSolarLongitudeInstant(
  targetLongitude: number,
  nearJulianDay: number,
): number {
  const DAYS_PER_DEGREE = 365.2422 / 360;
  let julianDay = nearJulianDay;

  for (let iteration = 0; iteration < 30; iteration += 1) {
    const difference = signedDegrees(
      targetLongitude - solarLongitude(julianDay),
    );

    if (Math.abs(difference) < 1e-8) {
      break;
    }

    julianDay += difference * DAYS_PER_DEGREE;
  }

  return julianDay;
}

/**
 * 주어진 양력 연도의 입춘(태양 황경 315°) 순간.
 *
 * 입춘은 늘 2월 3~5일 사이이므로 2월 4일을 출발점으로 삼는다.
 */
export function findStartOfSpring(gregorianYear: number): Date {
  const seed = toJulianDay(new Date(Date.UTC(gregorianYear, 1, 4)));
  return fromJulianDay(findSolarLongitudeInstant(315, seed));
}
