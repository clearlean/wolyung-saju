/**
 * 사주 계산에 쓰이는 고정 표.
 *
 * 인덱스는 모든 모듈에서 0-based 로 통일한다.
 * - 천간(stem): 0 甲 … 9 癸
 * - 지지(branch): 0 子 … 11 亥
 */

export const STEMS = [
  '甲',
  '乙',
  '丙',
  '丁',
  '戊',
  '己',
  '庚',
  '辛',
  '壬',
  '癸',
] as const;

export const STEM_READINGS = [
  '갑',
  '을',
  '병',
  '정',
  '무',
  '기',
  '경',
  '신',
  '임',
  '계',
] as const;

export const BRANCHES = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
] as const;

export const BRANCH_READINGS = [
  '자',
  '축',
  '인',
  '묘',
  '진',
  '사',
  '오',
  '미',
  '신',
  '유',
  '술',
  '해',
] as const;

export const BRANCH_ANIMALS = [
  '쥐',
  '소',
  '호랑이',
  '토끼',
  '용',
  '뱀',
  '말',
  '양',
  '원숭이',
  '닭',
  '개',
  '돼지',
] as const;

export type Element = '목' | '화' | '토' | '금' | '수';

export const ELEMENTS: readonly Element[] = ['목', '화', '토', '금', '수'];

export const ELEMENT_HANJA: Record<Element, string> = {
  목: '木',
  화: '火',
  토: '土',
  금: '金',
  수: '水',
};

/** 천간의 오행. */
export const STEM_ELEMENTS: readonly Element[] = [
  '목',
  '목',
  '화',
  '화',
  '토',
  '토',
  '금',
  '금',
  '수',
  '수',
];

/** 지지의 오행. */
export const BRANCH_ELEMENTS: readonly Element[] = [
  '수',
  '토',
  '목',
  '목',
  '토',
  '화',
  '화',
  '토',
  '금',
  '금',
  '토',
  '수',
];

/**
 * 지지의 정기(본기) 천간.
 *
 * 십신과 음양 판정은 지지의 표면 음양(子寅辰午申戌=양)이 아니라 정기를 기준으로 한다.
 * 子는 표면상 양이지만 정기가 癸(음수)이고, 巳는 표면상 음이지만 정기가 丙(양화)이다.
 */
export const BRANCH_MAIN_STEM: readonly number[] = [
  9, // 子 癸
  5, // 丑 己
  0, // 寅 甲
  1, // 卯 乙
  4, // 辰 戊
  2, // 巳 丙
  3, // 午 丁
  5, // 未 己
  6, // 申 庚
  7, // 酉 辛
  4, // 戌 戊
  8, // 亥 壬
];

/** 지지 속에 숨은 천간(지장간). 여기·중기·정기 순. */
export const HIDDEN_STEMS: readonly (readonly number[])[] = [
  [8, 9], // 子 壬癸
  [9, 7, 5], // 丑 癸辛己
  [4, 2, 0], // 寅 戊丙甲
  [0, 1], // 卯 甲乙
  [1, 9, 4], // 辰 乙癸戊
  [4, 6, 2], // 巳 戊庚丙
  [2, 5, 3], // 午 丙己丁
  [3, 1, 5], // 未 丁乙己
  [4, 8, 6], // 申 戊壬庚
  [6, 7], // 酉 庚辛
  [7, 3, 4], // 戌 辛丁戊
  [4, 0, 8], // 亥 戊甲壬
];

/** 오행 상생: 목생화, 화생토, 토생금, 금생수, 수생목. */
export const GENERATES: Record<Element, Element> = {
  목: '화',
  화: '토',
  토: '금',
  금: '수',
  수: '목',
};

/** 오행 상극: 목극토, 토극수, 수극화, 화극금, 금극목. */
export const CONTROLS: Record<Element, Element> = {
  목: '토',
  토: '수',
  수: '화',
  화: '금',
  금: '목',
};

export type TenGod =
  | '비견'
  | '겁재'
  | '식신'
  | '상관'
  | '편재'
  | '정재'
  | '편관'
  | '정관'
  | '편인'
  | '정인';

/** 십신을 다섯 갈래로 묶은 이름. 분석에서 비중을 셀 때 쓴다. */
export type TenGodGroup = '비겁' | '식상' | '재성' | '관성' | '인성';

export const TEN_GOD_GROUP: Record<TenGod, TenGodGroup> = {
  비견: '비겁',
  겁재: '비겁',
  식신: '식상',
  상관: '식상',
  편재: '재성',
  정재: '재성',
  편관: '관성',
  정관: '관성',
  편인: '인성',
  정인: '인성',
};

/**
 * 삼합 그룹별 도화·역마 지지.
 *
 * 도화는 삼합의 왕지(旺支), 역마는 삼합 첫 글자와 충하는 지지다.
 */
export const TRIAD_GROUPS: readonly {
  members: readonly number[];
  peachBlossom: number;
  travel: number;
}[] = [
  { members: [2, 6, 10], peachBlossom: 3, travel: 8 }, // 寅午戌 → 도화 卯, 역마 申
  { members: [8, 0, 4], peachBlossom: 9, travel: 2 }, // 申子辰 → 도화 酉, 역마 寅
  { members: [5, 9, 1], peachBlossom: 6, travel: 11 }, // 巳酉丑 → 도화 午, 역마 亥
  { members: [11, 3, 7], peachBlossom: 0, travel: 5 }, // 亥卯未 → 도화 子, 역마 巳
];

/** 홍염살: 일간별로 정해진 지지. */
export const RED_CHARM_BY_DAY_STEM: readonly number[] = [
  6, // 甲 午
  6, // 乙 午
  2, // 丙 寅
  7, // 丁 未
  4, // 戊 辰
  4, // 己 辰
  10, // 庚 戌
  9, // 辛 酉
  0, // 壬 子
  8, // 癸 申
];

/** 육충(六沖)은 지지 인덱스가 6 차이 나는 짝이다. */
export function isClash(branchA: number, branchB: number): boolean {
  return (branchA - branchB + 12) % 12 === 6;
}

/** 사주 표에서 오행별로 쓰는 색. 어두운 배경 위에서 한자가 또렷하게 보이도록 맞췄다. */
export const ELEMENT_COLORS: Record<
  Element,
  { fill: string; border: string; text: string }
> = {
  목: { fill: '#2c6b4f', border: '#57b98a', text: '#e8fff4' },
  화: { fill: '#8b3350', border: '#e57ba1', text: '#ffeaf2' },
  토: { fill: '#8a6820', border: '#e6c163', text: '#fff7de' },
  금: { fill: '#514094', border: '#a291e8', text: '#f1ecff' },
  수: { fill: '#1e5c84', border: '#68b6e4', text: '#e7f5ff' },
};

export function normalizeIndex(value: number, modulo: number): number {
  return ((value % modulo) + modulo) % modulo;
}
