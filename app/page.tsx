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
import { useState } from 'react';

import { Button } from '@/components/ui/button';

const readingPoints = ['올해의 큰 흐름', '연애와 관계운', '일과 재물운'];

type CalendarType = 'solar' | 'lunar';
type Gender = 'male' | 'female' | '';

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main className="min-h-dvh bg-[#090d1c] text-white">
      <section className="mx-auto min-h-dvh w-full max-w-[450px] overflow-hidden bg-[#0b1024] shadow-[0_0_70px_rgb(3_7_18/55%)] sm:rounded-[28px]">
        {isFormOpen ? (
          <BirthInfoForm onBack={() => setIsFormOpen(false)} />
        ) : (
          <HeroScreen onStart={() => setIsFormOpen(true)} />
        )}
      </section>
    </main>
  );
}

function HeroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative min-h-dvh">
      <img
        src="/moon-counselor.png"
        alt="푸른 달빛 아래 서 있는 월영당 사주 상담가"
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
            정통사주
          </h1>
          <p className="mx-auto mt-5 max-w-[19rem] text-[1.05rem] font-medium leading-7 text-[#f4f7ff] [text-shadow:0_3px_13px_rgb(0_0_0/70%)]">
            “당신의 계절이 바뀌는 순간,
            <br />
            운명의 결을 먼저 읽어드립니다”
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
          내 사주팔자 바로 확인하기
        </Button>
        <div className="mt-3 flex items-center justify-center gap-4 text-[0.76rem] font-medium text-[#c4d2f2]">
          <span className="inline-flex items-center gap-1.5">
            <MoonStar className="size-3.5" />
            프리미엄 풀이
          </span>
          <span className="h-3 w-px bg-white/20" />
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            생년월일 기반
          </span>
        </div>
      </div>
    </div>
  );
}

function BirthInfoForm({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [birthTime, setBirthTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<Gender>('');

  const canContinue =
    name.trim().length > 0 &&
    birthday.length === 10 &&
    (unknownTime || birthTime.length === 5) &&
    gender !== '';

  const handleBirthdayChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const parts = [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)];
    setBirthday(parts.filter(Boolean).join('.'));
  };

  const handleBirthTimeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    const nextValue =
      digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
    setBirthTime(nextValue);
  };

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <img
        src="/moon-counselor.png"
        alt=""
        aria-hidden="true"
        className="form-backdrop-image absolute inset-0 h-full w-full object-cover blur-[6px]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(13_20_36/86%)_0%,rgb(15_22_39/66%)_34%,rgb(12_16_27/84%)_72%,rgb(4_5_9/96%)_100%)]" />

      <button
        type="button"
        onClick={onBack}
        aria-label="첫 화면으로 돌아가기"
        className="absolute left-4 top-5 z-10 grid size-11 place-items-center rounded-full text-white transition hover:bg-white/10"
      >
        <ChevronLeft className="size-9 stroke-[2.5]" />
      </button>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="birth-form form-panel relative z-10 flex min-h-dvh flex-col justify-end"
      >
        <div className="birth-form-fields">
          <FieldBlock label="이름">
            <input
              value={name}
              onChange={(event) => setName(event.target.value.slice(0, 4))}
              placeholder="이름을 입력해 주세요. (최대 4글자)"
              aria-label="이름"
              className="form-line-input"
            />
          </FieldBlock>

          <FieldBlock
            label="생년월일"
            action={
              <div className="flex items-center gap-5">
                <ChoiceButton
                  active={calendarType === 'solar'}
                  label="양력"
                  onClick={() => setCalendarType('solar')}
                />
                <ChoiceButton
                  active={calendarType === 'lunar'}
                  label="음력"
                  onClick={() => setCalendarType('lunar')}
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

          <FieldBlock
            label="태어난 시간"
            action={
              <ChoiceButton
                active={unknownTime}
                label="시간 모름"
                onClick={() => setUnknownTime((value) => !value)}
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

          <fieldset>
            <legend className="gender-legend">성별</legend>
            <div className="gender-grid">
              <GenderButton
                active={gender === 'male'}
                label="남성"
                onClick={() => setGender('male')}
              />
              <GenderButton
                active={gender === 'female'}
                label="여성"
                onClick={() => setGender('female')}
              />
            </div>
          </fieldset>

          <Button
            type="button"
            disabled={!canContinue}
            className="next-button w-full bg-white/24 font-extrabold text-white/45 shadow-none disabled:opacity-100 enabled:bg-[linear-gradient(90deg,#d9e7ff,#ffffff_52%,#dce9ff)] enabled:text-[#111b34] enabled:hover:brightness-105"
          >
            다음으로
          </Button>
        </div>
      </form>
    </div>
  );
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
