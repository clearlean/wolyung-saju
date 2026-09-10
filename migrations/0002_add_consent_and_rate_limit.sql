-- 개인정보 수집·이용 동의 기록과 IP 기준 제출 제한.
--
-- 로컬 개발에서는 API 라우트가 같은 스키마를 만들어 두므로 따로 돌리지 않아도 된다.
-- 배포 환경에는 `wrangler d1 migrations apply` 로 적용한다.

ALTER TABLE submissions ADD COLUMN consent_version TEXT;
ALTER TABLE submissions ADD COLUMN consent_agreed_at TEXT;

-- 원문 IP 를 적재하지 않으려고 해시만 남긴다. IPv4 는 경우의 수가 적어
-- 해시만으로 되돌릴 수 있으므로, 익명화가 아니라 최소 수집 목적이다.
CREATE TABLE IF NOT EXISTS submission_attempts (
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attempts_ip_time
  ON submission_attempts(ip_hash, created_at);
