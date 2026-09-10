/**
 * 사주 소개팅 신청서를 D1 에 저장한다.
 *
 * 나중에 매칭 쿼리를 바로 걸 수 있도록, 원본 입력과 함께 계산된 사주 네 기둥과
 * 오행 분포도 같이 넣어 둔다.
 *
 * 같은 인스타그램 아이디로 다시 제출하면 기존 행을 덮어쓴다.
 */

import { env } from 'cloudflare:workers';

/** vite.config.ts 가 `.openai/hosting.json` 의 `d1` 값으로 만드는 바인딩 이름. */
const D1_BINDING = 'DB';

const CREATE_TABLE_SQL =
  'CREATE TABLE IF NOT EXISTS submissions (' +
  'id TEXT PRIMARY KEY, ' +
  'instagram_key TEXT NOT NULL UNIQUE, ' +
  'created_at TEXT NOT NULL, ' +
  'updated_at TEXT NOT NULL, ' +
  'name TEXT NOT NULL, ' +
  'birth_date TEXT NOT NULL, ' +
  'calendar_type TEXT NOT NULL, ' +
  'birth_time TEXT, ' +
  'hour_known INTEGER NOT NULL, ' +
  'gender TEXT NOT NULL, ' +
  'instagram TEXT NOT NULL, ' +
  'year_pillar TEXT NOT NULL, ' +
  'month_pillar TEXT NOT NULL, ' +
  'day_pillar TEXT NOT NULL, ' +
  'hour_pillar TEXT, ' +
  'element_counts TEXT NOT NULL)';

const CREATE_INDEX_SQL = [
  'CREATE INDEX IF NOT EXISTS idx_submissions_gender ON submissions(gender)',
  'CREATE INDEX IF NOT EXISTS idx_submissions_day_pillar ON submissions(day_pillar)',
];

const UPSERT_SQL = `
INSERT INTO submissions (
  id, instagram_key, created_at, updated_at, name, birth_date, calendar_type,
  birth_time, hour_known, gender, instagram,
  year_pillar, month_pillar, day_pillar, hour_pillar, element_counts
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(instagram_key) DO UPDATE SET
  updated_at = excluded.updated_at,
  name = excluded.name,
  birth_date = excluded.birth_date,
  calendar_type = excluded.calendar_type,
  birth_time = excluded.birth_time,
  hour_known = excluded.hour_known,
  gender = excluded.gender,
  instagram = excluded.instagram,
  year_pillar = excluded.year_pillar,
  month_pillar = excluded.month_pillar,
  day_pillar = excluded.day_pillar,
  hour_pillar = excluded.hour_pillar,
  element_counts = excluded.element_counts`;

/** 스키마 준비는 아이솔레이트마다 한 번만 한다. */
let schemaReady: Promise<void> | null = null;

function ensureSchema(database: D1Database): Promise<void> {
  schemaReady ??= (async () => {
    await database.exec(CREATE_TABLE_SQL);

    for (const statement of CREATE_INDEX_SQL) {
      await database.exec(statement);
    }
  })().catch((error: unknown) => {
    // 다음 요청에서 다시 시도할 수 있게 캐시를 비운다.
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}

function getDatabase(): D1Database | null {
  const binding = (env as Record<string, unknown>)[D1_BINDING];
  return binding ? (binding as D1Database) : null;
}

type IncomingBody = {
  name?: unknown;
  birthDate?: unknown;
  calendarType?: unknown;
  birthTime?: unknown;
  hourKnown?: unknown;
  gender?: unknown;
  instagram?: unknown;
  pillars?: {
    year?: unknown;
    month?: unknown;
    day?: unknown;
    hour?: unknown;
  };
  elementCounts?: unknown;
};

function asTrimmedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

export async function POST(request: Request): Promise<Response> {
  const database = getDatabase();

  if (!database) {
    return Response.json(
      {
        ok: false,
        error:
          'D1 바인딩이 없습니다. .openai/hosting.json 의 "d1" 값을 확인해 주세요.',
      },
      { status: 503 },
    );
  }

  let body: IncomingBody;

  try {
    body = (await request.json()) as IncomingBody;
  } catch {
    return Response.json(
      { ok: false, error: '본문을 읽을 수 없습니다.' },
      { status: 400 },
    );
  }

  const name = asTrimmedString(body.name, 40);
  const instagram = asTrimmedString(body.instagram, 30);
  const birthDate = asTrimmedString(body.birthDate, 10);
  const gender =
    body.gender === 'male' || body.gender === 'female' ? body.gender : null;
  const calendarType =
    body.calendarType === 'solar' || body.calendarType === 'lunar'
      ? body.calendarType
      : null;
  const yearPillar = asTrimmedString(body.pillars?.year, 4);
  const monthPillar = asTrimmedString(body.pillars?.month, 4);
  const dayPillar = asTrimmedString(body.pillars?.day, 4);

  if (
    !name ||
    !instagram ||
    !birthDate ||
    !gender ||
    !calendarType ||
    !yearPillar ||
    !monthPillar ||
    !dayPillar ||
    !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
    !/^[A-Za-z0-9._]{1,30}$/.test(instagram)
  ) {
    return Response.json(
      { ok: false, error: '입력값이 올바르지 않습니다.' },
      { status: 400 },
    );
  }

  const hourKnown = body.hourKnown === true;
  const birthTime = hourKnown ? asTrimmedString(body.birthTime, 5) : null;
  const hourPillar = hourKnown ? asTrimmedString(body.pillars?.hour, 4) : null;
  const now = new Date().toISOString();

  try {
    await ensureSchema(database);

    await database
      .prepare(UPSERT_SQL)
      .bind(
        crypto.randomUUID(),
        instagram.toLowerCase(),
        now,
        now,
        name,
        birthDate,
        calendarType,
        birthTime,
        hourKnown ? 1 : 0,
        gender,
        instagram,
        yearPillar,
        monthPillar,
        dayPillar,
        hourPillar,
        JSON.stringify(body.elementCounts ?? {}),
      )
      .run();

    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('신청서 저장 실패', error);

    return Response.json(
      { ok: false, error: '저장 중 문제가 생겼습니다.' },
      { status: 500 },
    );
  }
}
