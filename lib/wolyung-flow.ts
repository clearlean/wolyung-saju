export const FORM_STEPS = [
  'name',
  'birthday',
  'birth-time',
  'gender',
  'instagram',
] as const;

export type CalendarType = 'solar' | 'lunar';
export type Gender = 'male' | 'female' | '';
export type FormStep = (typeof FORM_STEPS)[number];
export type FlowScreen = 'intro' | FormStep | 'loading' | 'result';
export type Direction = 'forward' | 'backward';

/** 폼에서 모은 값. 저장과 사주 계산의 입력이 된다. */
export type SubmissionDraft = {
  name: string;
  /** 'YYYY.MM.DD' */
  birthday: string;
  calendarType: CalendarType;
  /** 'HH:MM'. 시간을 모르면 빈 문자열. */
  birthTime: string;
  unknownTime: boolean;
  gender: Exclude<Gender, ''>;
  /** @ 없이 저장한다. */
  instagram: string;
  /** 개인정보 수집·이용 동의. 체크하지 않으면 제출할 수 없다. */
  consentAgreed: boolean;
};

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
  instagram: {
    label: '인스타그램 아이디',
    placeholder: '@ 없이 입력해 주세요',
    ariaLabel: '인스타그램 아이디',
    // 인스타그램 규칙: 영문·숫자·마침표·밑줄, 최대 30자.
    maxLength: 30,
    helper: '연분이 닿으면 이 아이디로 서로를 이어 드립니다.',
  },
  calendar: {
    solarLabel: '양력',
    lunarLabel: '음력',
    // 음력→양력 변환은 아직 붙이지 않았다. 붙일 때 이 안내를 지우면 된다.
    lunarPendingLabel: '준비 중',
    lunarPendingNote:
      '음력 변환은 준비 중입니다. 지금은 양력으로 입력해 주세요.',
  },
} as const;

export const RESULT_COPY = {
  loading: {
    title: '풀이를 준비하고 있습니다',
    body: '입력해주신 생년월일의 결을 살피는 중입니다.',
  },
  chart: {
    title: '사주 원국',
    caption: '태어난 순간의 기운을 여덟 글자로 세운 것입니다.',
    stemLabel: '천간',
    branchLabel: '지지',
    unknownHour: '시간 미상',
    unknownHourNote:
      '태어난 시간을 몰라 시주를 비웠습니다. 나머지 여섯 글자로 풀이했습니다.',
  },
  reading: {
    title: '연애운 풀이',
    caption: '화두를 눌러 자세한 풀이를 펼쳐 보세요.',
  },
  cta: {
    label: '운명의 상대 찾기',
    note: '입력하신 정보는 매칭에만 씁니다.',
  },
  disclaimer:
    '사주 풀이는 재미로 보는 참고 자료입니다. 중요한 결정은 스스로 내려 주세요.',
} as const;

const ERROR_MESSAGES = {
  name: '필수 항목입니다.',
  birthday: '생년월일 8자리를 입력해 주세요.',
  'birth-time': '태어난 시간을 입력하거나 시간 모름을 선택해 주세요.',
  gender: '성별을 선택해 주세요.',
  instagram: '인스타그램 아이디를 입력해 주세요.',
  loading: '필수 항목입니다.',
  result: '필수 항목입니다.',
} satisfies Record<Exclude<FlowScreen, 'intro'>, string>;

export function getErrorMessage(screen: Exclude<FlowScreen, 'intro'>) {
  return ERROR_MESSAGES[screen];
}

/** 형식은 맞았지만 값이 말이 안 될 때 쓰는 문구. */
export const DETAIL_ERROR_MESSAGES = {
  birthdayNotReal: '실제로 있는 날짜를 입력해 주세요.',
  birthTimeRange: '00:00 부터 23:59 사이로 입력해 주세요.',
  instagramFormat: '영문·숫자·마침표·밑줄만 쓸 수 있습니다.',
} as const;
