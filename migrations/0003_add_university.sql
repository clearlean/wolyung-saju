-- 재학중인 대학교와 학과.
--
-- 연고대 에브리타임에 홍보하는 서비스라 학교는 두 곳만 받는다. 화면 문구가
-- 아니라 코드값('yonsei' / 'korea')을 넣어 두는 것은, 나중에 학교로 매칭을
-- 걸 때 표기가 흔들리지 않게 하려는 것이다.
--
-- 이 열이 생기기 전에 들어온 신청서가 있을 수 있어 NOT NULL 을 걸지 않는다.
-- 지금 폼은 둘 다 필수로 받고, 서버도 빠진 요청을 400 으로 돌려보낸다.

ALTER TABLE submissions ADD COLUMN university TEXT;
ALTER TABLE submissions ADD COLUMN department TEXT;

CREATE INDEX IF NOT EXISTS idx_submissions_university ON submissions(university);
