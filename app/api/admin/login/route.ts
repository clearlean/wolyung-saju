/**
 * 관리자 로그인.
 *
 * 비밀번호는 `ADMIN_PASSWORD` 환경변수에만 있다. 저장소에도, 코드에도 두지 않는다.
 * 환경변수가 없으면 관리자 화면은 아예 잠긴다. 빈 비밀번호로 열리는 일은 없다.
 */

import { env } from 'cloudflare:workers';

import {
  clearSessionCookie,
  createSessionCookie,
  isSecureRequest,
  timingSafeEqual,
} from '@/lib/admin-session';

/** 비밀번호를 자동으로 대입해 보는 시도를 늦추는 지연. */
const FAILED_ATTEMPT_DELAY_MS = 700;

function getAdminPassword(): string | null {
  const value = (env as Record<string, unknown>).ADMIN_PASSWORD;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request): Promise<Response> {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return Response.json(
      {
        ok: false,
        error:
          'ADMIN_PASSWORD 가 설정되지 않아 관리자 화면이 잠겨 있습니다. 로컬은 .dev.vars, 배포 환경은 시크릿에 넣어 주세요.',
      },
      { status: 503 },
    );
  }

  let password = '';

  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    password = '';
  }

  if (!timingSafeEqual(password, adminPassword)) {
    await delay(FAILED_ATTEMPT_DELAY_MS);

    return Response.json(
      { ok: false, error: '비밀번호가 맞지 않습니다.' },
      { status: 401 },
    );
  }

  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        'set-cookie': await createSessionCookie(
          adminPassword,
          isSecureRequest(request),
        ),
      },
    },
  );
}

export function DELETE(request: Request): Response {
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: { 'set-cookie': clearSessionCookie(isSecureRequest(request)) },
    },
  );
}
