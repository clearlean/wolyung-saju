'use client';

import {
  CalendarDays,
  Check,
  ChevronLeft,
  Circle,
  Menu,
  MoonStar,
  Sparkles,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

const readingPoints = ['사주 기반 궁합', '관계 성향 매칭', '프리미엄 소개팅'];
const formSteps = ['name', 'birthday', 'birth-time', 'gender'] as const;

type CalendarType = 'solar' | 'lunar';
type Gender = 'male' | 'female' | '';
type FormStep = (typeof formSteps)[number];
type FlowScreen = 'intro' | FormStep | 'loading' | 'complete';
type Direction = 'forward' | 'backward';

export default function Home() {
  const [screen, setScreen] = useState<FlowScreen>('intro');
  const [direction, setDirection] = useState<Direction>('forward');
  const previousScreen = useRef<FlowScreen>('intro');

  useEffect(() => {
    const syncScreenState = () => {
      const nextScreen = getScreenFromHash();
      setDirection(
        getScreenIndex(nextScreen) < getScreenIndex(previousScreen.current)
          ? 'backward'
          : 'forward',
      );
      previousScreen.current = nextScreen;
      setScreen(nextScreen);
    };

    syncScreenState();
    window.addEventListener('popstate', syncScreenState);
    window.addEventListener('hashchange', syncScreenState);

    return () => {
      window.removeEventListener('popstate', syncScreenState);
      window.removeEventListener('hashchange', syncScreenState);
    };
  }, []);

  const openForm = () => {
    goToScreen('name');
  };

  const goToScreen = (nextScreen: FlowScreen, mode: 'push' | 'replace' = 'push') => {
    const nextDirection =
      getScreenIndex(nextScreen) < getScreenIndex(previousScreen.current)
        ? 'backward'
        : 'forward';
    const nextUrl =
      nextScreen === 'intro'
        ? `${window.location.pathname}${window.location.search}`
        : `#_q=${nextScreen}`;

    if (mode === 'replace') {
      window.history.replaceState({ wolyungStep: nextScreen }, '', nextUrl);
    } else {
      window.history.pushState({ wolyungStep: nextScreen }, '', nextUrl);
    }

    previousScreen.current = nextScreen;
    setDirection(nextDirection);
    setScreen(nextScreen);
  };

  const handleBack = () => {
    goToScreen(getPreviousScreen(screen), 'replace');
  };

  return (
    <main className="min-h-dvh bg-[#090d1c] text-white">
      <section className="mx-auto min-h-dvh w-full max-w-[450px] overflow-hidden bg-[#0b1024] shadow-[0_0_70px_rgb(3_7_18/55%)] sm:rounded-[28px]">
        {screen === 'intro' ? (
          <HeroScreen onStart={openForm} />
        ) : (
          <BirthInfoForm
            direction={direction}
            onBack={handleBack}
            onReset={() => goToScreen('intro', 'replace')}
            onStepChange={goToScreen}
            screen={screen}
          />
        )}
      </section>
    </main>
  );
}

function getScreenFromHash(): FlowScreen {
  const hashValue = window.location.hash.replace('#_q=', '');

  if (
    formSteps.includes(hashValue as FormStep) ||
    hashValue === 'loading' ||
    hashValue === 'complete'
  ) {
    return hashValue as FlowScreen;
  }

  return 'intro';
}

function getScreenIndex(screen: FlowScreen) {
  if (screen === 'intro') {
    return -1;
  }

  if (screen === 'loading') {
    return formSteps.length;
  }

  if (screen === 'complete') {
    return formSteps.length + 1;
  }

  return formSteps.indexOf(screen);
}

function getPreviousScreen(screen: FlowScreen): FlowScreen {
  if (screen === 'loading' || screen === 'complete') {
    return 'gender';
  }

  const currentIndex = formSteps.indexOf(screen as FormStep);

  if (currentIndex > 0) {
    return formSteps[currentIndex - 1];
  }

  return 'intro';
}

function HeroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative min-h-dvh">
      <img
        src="/astrology-woman.png"
        alt="달빛 아래 점성술 차트를 살피는 월영당 상담가"
        className="hero-portrait absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_9_22/10%)_0%,rgb(6_10_28/20%)_38%,rgb(5_8_20/78%)_73%,rgb(4_7_18/96%)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_18%_4%,rgb(219_235_255/58%),transparent_21%),linear-gradient(180deg,rgb(2_5_19/35%),transparent)]" />
      <div className="stars-layer" aria-hidden="true" />

      <header className="relative z-10 flex items-center justify-between px-5 pt-5">
        <a href="/" aria-label="월영당 홈" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[7px] border border-[#e7c27a]/55 bg-[#7b1f2d]/95 text-[11px] font-bold leading-none text-[#ffe7b0]">
            月影
          </span>
          <span className="text-[1.35rem] font-semibold tracking-[0.08em] text-white [text-shadow:0_2px_14px_rgb(0_0_0/55%)]">
            월영당
          </span>
        </a>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="메뉴 열기"
          className="rounded-full bg-white/8 text-white shadow-[0_8px_24px_rgb(0_0_0/25%)] backdrop-blur-md hover:bg-white/16 hover:text-white"
        >
          <Menu className="size-6" />
        </Button>
      </header>

      <div className="relative z-10 flex min-h-dvh flex-col justify-end px-5 pb-[104px] pt-24">
        <div className="mb-6 text-center">
          <p className="mb-2 text-[1.28rem] font-semibold tracking-[0.06em] text-[#f9f5ea] [text-shadow:0_3px_15px_rgb(0_0_0/70%)]">
            월영아씨
          </p>
          <h1 className="font-serif text-[clamp(4.15rem,18vw,5.7rem)] font-black leading-[0.92] tracking-normal text-white [text-shadow:0_10px_28px_rgb(0_0_0/70%),0_0_24px_rgb(120_166_255/70%)]">
            사주 소개팅
          </h1>
          <p className="mx-auto mt-5 max-w-[19rem] text-[1.05rem] font-medium leading-7 text-[#f4f7ff] [text-shadow:0_3px_13px_rgb(0_0_0/70%)]">
            왠지 끌리는 사람에게는
            <br />
            이유가 있습니다
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {readingPoints.map((point) => (
            <div
              key={point}
              className="rounded-[8px] border border-white/16 bg-[#071127]/50 px-2 py-3 text-center text-[0.82rem] font-semibold text-[#dce9ff] shadow-[0_8px_28px_rgb(0_0_0/22%)] backdrop-blur-md"
            >
              {point}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[450px] bg-[linear-gradient(180deg,transparent,rgb(4_7_18/92%)_18%,rgb(4_7_18/98%))] px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-8 sm:absolute">
        <Button
          type="button"
          size="lg"
          onClick={onStart}
          className="h-14 w-full rounded-[8px] border border-white/55 bg-[linear-gradient(90deg,#d9e7ff,#ffffff_48%,#dbe8ff)] text-[1rem] font-extrabold text-[#101b35] shadow-[0_16px_36px_rgb(9_17_42/50%),inset_0_0_0_1px_rgb(255_255_255/60%)] hover:brightness-105"
        >
          <Sparkles className="size-5" data-icon="inline-start" />
          내 연분 확인하기
        </Button>
        <div className="mt-3 flex items-center justify-center gap-4 text-[0.76rem] font-medium text-[#c4d2f2]">
          <span className="inline-flex items-center gap-1.5">
            <MoonStar className="size-3.5" />
            사주 기반 궁합
          </span>
          <span className="h-3 w-px bg-white/20" />
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            프리미엄 소개팅
          </span>
        </div>
      </div>
    </div>
  );
}

function BirthInfoForm({
  direction,
  onBack,
  onReset,
  onStepChange,
  screen,
}: {
  direction: Direction;
  onBack: () => void;
  onReset: () => void;
  onStepChange: (screen: FlowScreen, mode?: 'push' | 'replace') => void;
  screen: Exclude<FlowScreen, 'intro'>;
}) {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [birthTime, setBirthTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<Gender>('');
  const [error, setError] = useState<{
    message: string;
    screen: Exclude<FlowScreen, 'intro'>;
  } | null>(null);

  const currentStepIndex = formSteps.indexOf(screen as FormStep);
  const progress = currentStepIndex >= 0 ? currentStepIndex + 1 : formSteps.length;
  const progressWidth = `${(progress / formSteps.length) * 100}%`;
  const currentError = error?.screen === screen ? error.message : '';

  useEffect(() => {
    if (screen !== 'loading') {
      return;
    }

    const timer = window.setTimeout(() => {
      onStepChange('complete', 'replace');
    }, 1300);

    return () => window.clearTimeout(timer);
  }, [onStepChange, screen]);

  const handleBirthdayChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const parts = [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)];
    setBirthday(parts.filter(Boolean).join('.'));
    setError(null);
  };

  const handleBirthTimeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    const nextValue =
      digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
    setBirthTime(nextValue);
    setError(null);
  };

  const validateCurrentStep = () => {
    if (screen === 'name') {
      return name.trim().length > 0;
    }

    if (screen === 'birthday') {
      return birthday.length === 10;
    }

    if (screen === 'birth-time') {
      return unknownTime || birthTime.length === 5;
    }

    if (screen === 'gender') {
      return gender !== '';
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      setError({ message: getErrorMessage(screen), screen });
      return;
    }

    const nextStep = formSteps[currentStepIndex + 1];
    onStepChange(nextStep ?? 'loading');
  };

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <img
        src="/astrology-woman.png"
        alt=""
        aria-hidden="true"
        className="form-backdrop-image absolute inset-0 h-full w-full object-cover blur-[6px]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(13_20_36/86%)_0%,rgb(15_22_39/66%)_34%,rgb(12_16_27/84%)_72%,rgb(4_5_9/96%)_100%)]" />

      <button
        type="button"
        onClick={onBack}
        aria-label="이전 단계로 돌아가기"
        className="absolute left-4 top-5 z-30 grid size-11 place-items-center rounded-full text-white transition hover:bg-white/10"
      >
        <ChevronLeft className="size-9 stroke-[2.5]" />
      </button>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="birth-form relative z-10 flex min-h-dvh flex-col"
      >
        {screen !== 'complete' && (
          <div className="form-progress" aria-label={`진행률 ${progress}/${formSteps.length}`}>
            <span>
              {progress}/{formSteps.length}
            </span>
            <div className="form-progress-track">
              <div
                className="form-progress-bar"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        )}

        <div
          key={screen}
          className={`form-step-panel form-step-${direction}`}
        >
          {screen === 'name' && (
            <FieldBlock label="이름">
              <input
                value={name}
                onChange={(event) => {
                  setName(event.target.value.slice(0, 4));
                  setError(null);
                }}
                placeholder="이름을 입력해 주세요. (최대 4글자)"
                aria-label="이름"
                className="form-line-input"
              />
            </FieldBlock>
          )}

          {screen === 'birthday' && (
            <FieldBlock
              label="생년월일"
              action={
                <div className="flex items-center gap-5">
                  <ChoiceButton
                    active={calendarType === 'solar'}
                    label="양력"
                    onClick={() => {
                      setCalendarType('solar');
                      setError(null);
                    }}
                  />
                  <ChoiceButton
                    active={calendarType === 'lunar'}
                    label="음력"
                    onClick={() => {
                      setCalendarType('lunar');
                      setError(null);
                    }}
                  />
                </div>
              }
            >
              <input
                inputMode="numeric"
                value={birthday}
                onChange={(event) => handleBirthdayChange(event.target.value)}
                placeholder="0000.00.00"
                aria-label="생년월일"
                className="form-line-input"
              />
            </FieldBlock>
          )}

          {screen === 'birth-time' && (
            <FieldBlock
              label="태어난 시간"
              action={
                <ChoiceButton
                  active={unknownTime}
                  label="시간 모름"
                  onClick={() => {
                    setUnknownTime((value) => !value);
                    setError(null);
                  }}
                />
              }
            >
              <input
                inputMode="numeric"
                value={birthTime}
                onChange={(event) => handleBirthTimeChange(event.target.value)}
                disabled={unknownTime}
                placeholder="태어난 시간 입력 (예: 13:20)"
                aria-label="태어난 시간"
                className="form-line-input disabled:text-white/35"
              />
            </FieldBlock>
          )}

          {screen === 'gender' && (
            <fieldset>
              <legend className="gender-legend">성별</legend>
              <div className="gender-grid">
                <GenderButton
                  active={gender === 'male'}
                  label="남성"
                  onClick={() => {
                    setGender('male');
                    setError(null);
                  }}
                />
                <GenderButton
                  active={gender === 'female'}
                  label="여성"
                  onClick={() => {
                    setGender('female');
                    setError(null);
                  }}
                />
              </div>
            </fieldset>
          )}

          {screen === 'loading' && (
            <output className="result-panel" aria-live="polite">
              <Sparkles className="size-9 text-[#dbe8ff]" />
              <p className="result-title">풀이를 준비하고 있습니다</p>
              <p className="result-copy">입력해주신 생년월일의 결을 살피는 중입니다.</p>
            </output>
          )}

          {screen === 'complete' && (
            <div className="result-panel">
              <MoonStar className="size-10 text-[#dbe8ff]" />
              <p className="result-title">사주 정보 입력 완료</p>
              <p className="result-copy">월영당의 풀이를 곧 이어서 확인하실 수 있습니다.</p>
              <Button
                type="button"
                onClick={onReset}
                className="next-button mt-7 w-full bg-[linear-gradient(90deg,#d9e7ff,#ffffff_52%,#dce9ff)] font-extrabold text-[#111b34] hover:brightness-105"
              >
                처음으로
              </Button>
            </div>
          )}

          {currentError && <p className="form-error">{currentError}</p>}
        </div>

        {screen !== 'loading' && screen !== 'complete' && (
          <div className="form-bottom-action">
            <Button
              type="button"
              onClick={handleNext}
              className="next-button w-full bg-[linear-gradient(90deg,#d9e7ff,#ffffff_52%,#dce9ff)] font-extrabold text-[#111b34] hover:brightness-105"
            >
              <Sparkles className="size-5" data-icon="inline-start" />
              {screen === 'gender' ? '풀이 시작하기' : '다음으로'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

function getErrorMessage(screen: Exclude<FlowScreen, 'intro'>) {
  if (screen === 'birthday') {
    return '생년월일 8자리를 입력해 주세요.';
  }

  if (screen === 'birth-time') {
    return '태어난 시간을 입력하거나 시간 모름을 선택해 주세요.';
  }

  if (screen === 'gender') {
    return '성별을 선택해 주세요.';
  }

  return '필수 항목입니다.';
}

function FieldBlock({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="form-field">
      <span className="form-field-header">
        <span className="form-field-label">{label}</span>
        {action}
      </span>
      {children}
    </div>
  );
}

function ChoiceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const Icon = active ? Check : Circle;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="choice-button"
    >
      <span
        className={`choice-icon ${
          active ? 'bg-white text-[#172039]' : 'text-white/58'
        }`}
      >
        <Icon className="choice-icon-svg" />
      </span>
      {label}
    </button>
  );
}

function GenderButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="gender-button"
    >
      {label}
    </button>
  );
}
