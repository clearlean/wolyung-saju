-- 사주 소개팅 신청서.
-- 로컬 개발에서는 API 라우트가 같은 스키마를 CREATE TABLE IF NOT EXISTS 로 만든다.
-- 이 파일은 `wrangler d1 migrations apply` 로 배포 환경에 적용하기 위한 것이다.

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  instagram_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  calendar_type TEXT NOT NULL,
  birth_time TEXT,
  hour_known INTEGER NOT NULL,
  gender TEXT NOT NULL,
  instagram TEXT NOT NULL,
  year_pillar TEXT NOT NULL,
  month_pillar TEXT NOT NULL,
  day_pillar TEXT NOT NULL,
  hour_pillar TEXT,
  element_counts TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_gender ON submissions(gender);
CREATE INDEX IF NOT EXISTS idx_submissions_day_pillar ON submissions(day_pillar);
