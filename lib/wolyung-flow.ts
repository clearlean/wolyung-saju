export const FORM_STEPS = ['name', 'birthday', 'birth-time', 'gender'] as const;

export type CalendarType = 'solar' | 'lunar';
export type Gender = 'male' | 'female' | '';
export type FormStep = (typeof FORM_STEPS)[number];
export type FlowScreen = 'intro' | FormStep | 'loading' | 'complete';
export type Direction = 'forward' | 'backward';

export const HERO_COPY = {
  brand: '월영아씨',
  logoMark: '月影',
  logoText: '월영당',
  navLabel: '월영당 홈',
  imageAlt: '달빛 아래 점성술 차트를 살피는 월영당 상담가',
  title: '사주 소개팅',
  description: ['왠지 끌리는 사람에게는', '이유가 있습니다'],
  cta: '내 연분 확인하기',
} as const;

export const READING_POINTS = [
  '사주 기반 궁합',
  '관계 성향 매칭',
  '프리미엄 소개팅',
] as const;

export const HERO_FOOTER_POINTS = [
  '사주 기반 궁합',
  '프리미엄 소개팅',
] as const;

export const FORM_COPY = {
  backLabel: '이전 단계로 돌아가기',
  nextLabel: '다음으로',
  submitLabel: '풀이 시작하기',
  resetLabel: '처음으로',
  progressLabel: (current: number, total: number) =>
    `진행률 ${current}/${total}`,
} as const;

export const FIELD_COPY = {
  name: {
    label: '이름',
    placeholder: '이름을 입력해 주세요. (최대 4글자)',
    ariaLabel: '이름',
    maxLength: 4,
  },
  birthday: {
    label: '생년월일',
    placeholder: '0000.00.00',
    ariaLabel: '생년월일',
  },
  birthTime: {
    label: '태어난 시간',
    placeholder: '태어난 시간 입력 (예: 13:20)',
    ariaLabel: '태어난 시간',
    unknownLabel: '시간 모름',
  },
  gender: {
    label: '성별',
    maleLabel: '남성',
    femaleLabel: '여성',
  },
  calendar: {
    solarLabel: '양력',
    lunarLabel: '음력',
  },
} as const;

export const RESULT_COPY = {
  loading: {
    title: '풀이를 준비하고 있습니다',
    body: '입력해주신 생년월일의 결을 살피는 중입니다.',
  },
  complete: {
    title: '사주 정보 입력 완료',
    body: '월영당의 풀이를 곧 이어서 확인하실 수 있습니다.',
  },
} as const;

const ERROR_MESSAGES = {
  name: '필수 항목입니다.',
  birthday: '생년월일 8자리를 입력해 주세요.',
  'birth-time': '태어난 시간을 입력하거나 시간 모름을 선택해 주세요.',
  gender: '성별을 선택해 주세요.',
  loading: '필수 항목입니다.',
  complete: '필수 항목입니다.',
} satisfies Record<Exclude<FlowScreen, 'intro'>, string>;

export function getErrorMessage(screen: Exclude<FlowScreen, 'intro'>) {
  return ERROR_MESSAGES[screen];
}
