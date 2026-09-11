/**
 * 사주 네 기둥(연주·월주·일주·시주)과 그로부터 나오는 파생 정보를 계산한다.
 *
 * 판정 기준
 * - 연주: 입춘(태양 황경 315°)에 바뀐다. 양력 1월생과 입춘 전 2월생은 전년도 간지다.
 * - 월주: 절기로 나뉜다. 출생 순간의 태양 황경을 30° 구간으로 끊어 월지를 정한다.
 * - 일주: 율리우스일 기반 60갑자. 진태양시 자정에 바뀐다.
 * - 시주: 일간에 오자둔을 적용하고, 23시~01시를 자시로 본다.
 *
 * 일주 경계는 자정으로 잡았다(야자시를 당일 일간으로 본다). 23시 기준으로 바꾸려면
 * `DAY_CHANGES_AT_MIDNIGHT` 만 뒤집으면 된다.
 */

import {
  findStartOfSpring,
  solarLongitude,
  toJulianDay,
  toJulianDayNumber,
} from './astronomy';
import {
  BRANCHES,
  BRANCH_ANIMALS,
  BRANCH_ELEMENTS,
  BRANCH_MAIN_STEM,
  BRANCH_READINGS,
  CONTROLS,
  ELEMENTS,
  GENERATES,
  RED_CHARM_BY_DAY_STEM,
  STEMS,
  STEM_ELEMENTS,
  STEM_READINGS,
  TEN_GOD_GROUP,
  TRIAD_GROUPS,
  isClash,
  normalizeIndex,
  type Element,
  type TenGod,
  type TenGodGroup,
} from './constants';
import { toTrueSolarClock, toUtcInstant } from './korea-time';

/** true 면 일주가 진태양시 자정에 바뀐다. false 면 23시(야자시)에 바뀐다. */
const DAY_CHANGES_AT_MIDNIGHT = true;

export type Gender = 'male' | 'female';

export type SajuInput = {
  year: number;
  /** 1 ~ 12 */
  month: number;
  day: number;
  /** 시간을 모르면 hourKnown 을 false 로 두고 hour/minute 는 무시된다. */
  hour: number;
  minute: number;
  hourKnown: boolean;
  gender: Gender;
};

export type PillarPosition = 'hour' | 'day' | 'month' | 'year';

export type Pillar = {
  position: PillarPosition;
  /** 기둥 이름. 예: '일주' */
  label: string;
  stem: number;
  branch: number;
  stemHanja: string;
  stemReading: string;
  stemElement: Element;
  branchHanja: string;
  branchReading: string;
  branchElement: Element;
  branchAnimal: string;
  /** 일간 자신은 십신이 없으므로 null 이다. */
  stemTenGod: TenGod | null;
  branchTenGod: TenGod;
  /** 60갑자 표기. 예: '庚申' */
  sexagenary: string;
};

export type SajuChart = {
  input: SajuInput;
  /** 시간을 모르면 시주가 빠진다. */
  hourPillar: Pillar | null;
  dayPillar: Pillar;
  monthPillar: Pillar;
  yearPillar: Pillar;
  /** 표시 순서(시·일·월·연)대로 담은 배열. 시주를 모르면 null 이 들어간다. */
  pillars: readonly (Pillar | null)[];
  /** 일간. 사주에서 '나'에 해당한다. */
  dayStem: number;
  dayStemElement: Element;
  /** 일지. 배우자궁으로 본다. */
  daySpouseBranch: number;
  /** 오행별 개수. 시주를 모르면 6글자, 알면 8글자를 센다. */
  elementCounts: Record<Element, number>;
  /** 가장 많은 오행. 동수면 목·화·토·금·수 순으로 앞선 것. */
  dominantElement: Element;
  /** 개수가 0인 오행. */
  missingElements: readonly Element[];
  /** 십신 묶음별 개수. */
  tenGodGroupCounts: Record<TenGodGroup, number>;
  /** 남명은 재성, 여명은 관성을 배우자성으로 본다. */
  spouseStar: TenGodGroup;
  spouseStarCount: number;
  /** 도화살에 해당하는 지지가 사주에 있는지. */
  hasPeachBlossom: boolean;
  /** 홍염살 여부. */
  hasRedCharm: boolean;
  /** 역마살 여부. */
  hasTravelStar: boolean;
  /** 일지가 다른 지지와 충하는지. 배우자궁이 흔들리는 신호로 본다. */
  spousePalaceClashed: boolean;
  /** 계산에 쓴 실제 UTC 순간. */
  utcInstant: Date;
  /** 출생 순간의 태양 황경(도). */
  solarLongitudeDegrees: number;
};

const PILLAR_LABELS: Record<PillarPosition, string> = {
  hour: '시주',
  day: '일주',
  month: '월주',
  year: '연주',
};

/**
 * 태양 황경으로 월지를 정한다.
 *
 * 입춘(315°)부터 인월이 시작하고 30°마다 다음 지지로 넘어간다.
 */
function branchFromSolarLongitude(longitudeDegrees: number): number {
  const stepsFromSpring = Math.floor(
    normalizeIndex(longitudeDegrees - 315, 360) / 30,
  );

  // 인월(index 2)에서 출발한다.
  return normalizeIndex(stepsFromSpring + 2, 12);
}

/**
 * 오호둔: 연간으로 인월의 천간이 정해진다.
 * 갑기년 병인월, 을경년 무인월, 병신년 경인월, 정임년 임인월, 무계년 갑인월.
 */
function firstMonthStem(yearStem: number): number {
  return normalizeIndex((yearStem % 5) * 2 + 2, 10);
}

/**
 * 오자둔: 일간으로 자시의 천간이 정해진다.
 * 갑기일 갑자시, 을경일 병자시, 병신일 무자시, 정임일 경자시, 무계일 임자시.
 */
function firstHourStem(dayStem: number): number {
  return normalizeIndex((dayStem % 5) * 2, 10);
}

/**
 * 일주의 60갑자 인덱스.
 *
 * 기준점은 2000-01-01 = 戊午일이다. 이 날의 정수 율리우스일은 2451545이고
 * 戊午의 60갑자 인덱스는 54이므로, (율리우스일 + 49) % 60 이 성립한다.
 */
function sexagenaryIndexOfDay(julianDayNumber: number): number {
  return normalizeIndex(julianDayNumber + 49, 60);
}

/** 시지: 23~01시가 자시이고 두 시간마다 넘어간다. */
function branchFromHour(hour: number): number {
  return Math.floor(normalizeIndex(hour + 1, 24) / 2);
}

/** 일간에서 본 상대 천간의 십신. */
export function tenGodOf(dayStem: number, otherStem: number): TenGod {
  const self = STEM_ELEMENTS[dayStem];
  const other = STEM_ELEMENTS[otherStem];
  const samePolarity = dayStem % 2 === otherStem % 2;

  if (other === self) {
    return samePolarity ? '비견' : '겁재';
  }

  if (GENERATES[self] === other) {
    return samePolarity ? '식신' : '상관';
  }

  if (CONTROLS[self] === other) {
    return samePolarity ? '편재' : '정재';
  }

  if (CONTROLS[other] === self) {
    return samePolarity ? '편관' : '정관';
  }

  return samePolarity ? '편인' : '정인';
}

function buildPillar(
  position: PillarPosition,
  stem: number,
  branch: number,
  dayStem: number,
): Pillar {
  return {
    position,
    label: PILLAR_LABELS[position],
    stem,
    branch,
    stemHanja: STEMS[stem],
    stemReading: STEM_READINGS[stem],
    stemElement: STEM_ELEMENTS[stem],
    branchHanja: BRANCHES[branch],
    branchReading: BRANCH_READINGS[branch],
    branchElement: BRANCH_ELEMENTS[branch],
    branchAnimal: BRANCH_ANIMALS[branch],
    stemTenGod: position === 'day' ? null : tenGodOf(dayStem, stem),
    branchTenGod: tenGodOf(dayStem, BRANCH_MAIN_STEM[branch]),
    sexagenary: `${STEMS[stem]}${BRANCHES[branch]}`,
  };
}

/** 사주 연도(입춘 기준)의 간지. */
export function sexagenaryOfYear(sajuYear: number): {
  stem: number;
  branch: number;
} {
  return {
    stem: normalizeIndex(sajuYear - 4, 10),
    branch: normalizeIndex(sajuYear - 4, 12),
  };
}

export function calculateSaju(input: SajuInput): SajuChart {
  const hour = input.hourKnown ? input.hour : 12;
  const minute = input.hourKnown ? input.minute : 0;
  const clock = {
    year: input.year,
    month: input.month,
    day: input.day,
    hour,
    minute,
  };

  const utcInstant = toUtcInstant(clock);
  const longitudeDegrees = solarLongitude(toJulianDay(utcInstant));

  // 연주 — 입춘 전이면 전년도 간지다.
  const sajuYear =
    utcInstant < findStartOfSpring(input.year) ? input.year - 1 : input.year;
  const { stem: yearStem, branch: yearBranch } = sexagenaryOfYear(sajuYear);

  // 월주 — 절기로 정한 월지에 오호둔을 적용한다.
  const monthBranch = branchFromSolarLongitude(longitudeDegrees);
  const monthsFromFirst = normalizeIndex(monthBranch - 2, 12);
  const monthStem = normalizeIndex(
    firstMonthStem(yearStem) + monthsFromFirst,
    10,
  );

  // 일주 — 진태양시 기준으로 날짜를 센다.
  const solarClock = toTrueSolarClock(clock);
  const solarClockHour = solarClock.getUTCHours();
  const dayShift = !DAY_CHANGES_AT_MIDNIGHT && solarClockHour >= 23 ? 1 : 0;
  const dayIndex = sexagenaryIndexOfDay(
    toJulianDayNumber(toJulianDay(solarClock)) + dayShift,
  );
  const dayStem = normalizeIndex(dayIndex, 10);
  const dayBranch = normalizeIndex(dayIndex, 12);

  // 시주 — 일간에 오자둔을 적용한다.
  const hourBranch = branchFromHour(solarClockHour);
  const hourStem = normalizeIndex(firstHourStem(dayStem) + hourBranch, 10);

  const dayPillar = buildPillar('day', dayStem, dayBranch, dayStem);
  const monthPillar = buildPillar('month', monthStem, monthBranch, dayStem);
  const yearPillar = buildPillar('year', yearStem, yearBranch, dayStem);
  const hourPillar = input.hourKnown
    ? buildPillar('hour', hourStem, hourBranch, dayStem)
    : null;

  const presentPillars = [
    hourPillar,
    dayPillar,
    monthPillar,
    yearPillar,
  ].filter((pillar): pillar is Pillar => pillar !== null);

  const elementCounts = countElements(presentPillars);
  const tenGodGroupCounts = countTenGodGroups(presentPillars);
  const branches = presentPillars.map((pillar) => pillar.branch);
  const spouseStar: TenGodGroup = input.gender === 'male' ? '재성' : '관성';

  return {
    input,
    hourPillar,
    dayPillar,
    monthPillar,
    yearPillar,
    pillars: [hourPillar, dayPillar, monthPillar, yearPillar],
    dayStem,
    dayStemElement: STEM_ELEMENTS[dayStem],
    daySpouseBranch: dayBranch,
    elementCounts,
    dominantElement: pickDominantElement(elementCounts),
    missingElements: ELEMENTS.filter((element) => elementCounts[element] === 0),
    tenGodGroupCounts,
    spouseStar,
    spouseStarCount: tenGodGroupCounts[spouseStar],
    hasPeachBlossom: hasStar(branches, dayBranch, yearBranch, 'peachBlossom'),
    hasRedCharm: branches.includes(RED_CHARM_BY_DAY_STEM[dayStem]),
    hasTravelStar: hasStar(branches, dayBranch, yearBranch, 'travel'),
    spousePalaceClashed: branches.some(
      (branch) => branch !== dayBranch && isClash(branch, dayBranch),
    ),
    utcInstant,
    solarLongitudeDegrees: longitudeDegrees,
  };
}

function countElements(pillars: readonly Pillar[]): Record<Element, number> {
  const counts: Record<Element, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

  for (const pillar of pillars) {
    counts[pillar.stemElement] += 1;
    counts[pillar.branchElement] += 1;
  }

  return counts;
}

/** 일간 자신은 십신이 없으므로 비겁 수에 들어가지 않는다. */
function countTenGodGroups(
  pillars: readonly Pillar[],
): Record<TenGodGroup, number> {
  const counts: Record<TenGodGroup, number> = {
    비겁: 0,
    식상: 0,
    재성: 0,
    관성: 0,
    인성: 0,
  };

  for (const pillar of pillars) {
    if (pillar.stemTenGod) {
      counts[TEN_GOD_GROUP[pillar.stemTenGod]] += 1;
    }

    counts[TEN_GOD_GROUP[pillar.branchTenGod]] += 1;
  }

  return counts;
}

function pickDominantElement(counts: Record<Element, number>): Element {
  return ELEMENTS.reduce((best, element) =>
    counts[element] > counts[best] ? element : best,
  );
}

/**
 * 도화·역마는 일지 또는 연지가 속한 삼합을 기준으로 본다.
 * 두 기준 중 하나라도 걸리면 해당 살이 있는 것으로 처리한다.
 */
function hasStar(
  branches: readonly number[],
  dayBranch: number,
  yearBranch: number,
  kind: 'peachBlossom' | 'travel',
): boolean {
  return [dayBranch, yearBranch].some((base) => {
    const group = TRIAD_GROUPS.find((candidate) =>
      candidate.members.includes(base),
    );

    return group ? branches.includes(group[kind]) : false;
  });
}
