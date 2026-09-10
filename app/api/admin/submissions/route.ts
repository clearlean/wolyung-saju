/**
 * 관리자용 신청서 조회와 파기.
 *
 * 실명과 생년월일이 오가는 창구라 유효한 관리자 세션 없이는 아무것도 돌려주지
 * 않는다. 삭제는 동의 문구에 적어 둔 "삭제 요청" 을 실제로 이행하는 수단이다.
 */

import { env } from 'cloudflare:workers';

import { hasValidSession } from '@/lib/admin-session';

const D1_BINDING = 'DB';

/** 한 번에 내려보낼 최대 행 수. */
const MAX_ROWS = 500;

const SELECT_SQL = `
SELECT instagram, name, birth_date, birth_time, hour_known, gender,
       year_pillar, month_pillar, day_pillar, hour_pillar, element_counts,
       consent_version, created_at, updated_at
FROM submissions
ORDER BY created_at DESC
LIMIT ?`;

type SubmissionRow = {
  instagram: string;
  name: string;
  birth_date: string;
  birth_time: string | null;
  hour_known: number;
  gender: string;
  year_pillar: string;
  month_pillar: string;
  day_pillar: string;
  hour_pillar: string | null;
  element_counts: string;
  consent_version: string | null;
  created_at: string;
  updated_at: string;
};

function getDatabase(): D1Database | null {
  const binding = (env as Record<string, unknown>)[D1_BINDING];
  return binding ? (binding as D1Database) : null;
}

function getAdminPassword(): string | null {
  const value = (env as Record<string, unknown>).ADMIN_PASSWORD;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** 통과하면 데이터베이스를, 막히면 그대로 돌려보낼 응답을 준다. */
async function guard(
  request: Request,
): Promise<{ database: D1Database } | Response> {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return Response.json(
      { ok: false, error: 'ADMIN_PASSWORD 가 설정되지 않았습니다.' },
      { status: 503 },
    );
  }

  if (!(await hasValidSession(request, adminPassword))) {
    return Response.json(
      { ok: false, error: '로그인이 필요합니다.' },
      { status: 401 },
    );
  }

  const database = getDatabase();

  if (!database) {
    return Response.json(
      { ok: false, error: 'D1 바인딩이 없습니다.' },
      { status: 503 },
    );
  }

  return { database };
}

export async function GET(request: Request): Promise<Response> {
  const checked = await guard(request);

  if (checked instanceof Response) {
    return checked;
  }

  try {
    const result = await checked.database
      .prepare(SELECT_SQL)
      .bind(MAX_ROWS)
      .all<SubmissionRow>();

    return Response.json(
      { ok: true, rows: result.results, total: result.results.length },
      { status: 200, headers: { 'cache-control': 'private, no-store' } },
    );
  } catch (error) {
    console.error('신청서 조회 실패', error);

    return Response.json(
      { ok: false, error: '조회 중 문제가 생겼습니다.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const checked = await guard(request);

  if (checked instanceof Response) {
    return checked;
  }

  const instagram = new URL(request.url).searchParams.get('instagram');

  if (!instagram) {
    return Response.json(
      { ok: false, error: '지울 대상을 지정해 주세요.' },
      { status: 400 },
    );
  }

  try {
    const result = await checked.database
      .prepare('DELETE FROM submissions WHERE instagram_key = ?')
      .bind(instagram.toLowerCase())
      .run();

    return Response.json(
      { ok: true, deleted: result.meta.changes },
      { status: 200 },
    );
  } catch (error) {
    console.error('신청서 삭제 실패', error);

    return Response.json(
      { ok: false, error: '삭제 중 문제가 생겼습니다.' },
      { status: 500 },
    );
  }
}
