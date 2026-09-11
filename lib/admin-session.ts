/**
 * 관리자 세션.
 *
 * 워커는 요청마다 다른 아이솔레이트에서 돌 수 있어서 서버 메모리에 세션을 둘 수
 * 없다. 그래서 만료 시각에 서명을 붙인 쿠키를 그대로 세션으로 쓴다. 서명 키는
 * 관리자 비밀번호이므로, 비밀번호를 바꾸면 기존 세션이 모두 무효가 된다.
 *
 * 비밀번호는 어디에도 저장하지 않는다. `ADMIN_PASSWORD` 환경변수로만 읽는다.
 */

export const ADMIN_COOKIE_NAME = 'wolyung_admin';

/** 세션 유효 기간. */
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

const encoder = new TextEncoder();

async function sign(message: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(message),
  );

  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 길이와 무관하게 같은 시간이 걸리는 비교.
 *
 * 비밀번호를 한 글자씩 끊어 맞추는 타이밍 공격을 막는다.
 */
export function timingSafeEqual(left: string, right: string): boolean {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);

  // 길이가 다르면 어차피 실패지만, 길이 차이로 일찍 빠져나가지 않도록
  // 항상 같은 횟수를 돈다.
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

/** 로그인에 성공했을 때 내려보낼 Set-Cookie 값. */
export async function createSessionCookie(
  password: string,
  secure: boolean,
): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const signature = await sign(String(expiresAt), password);

  return [
    `${ADMIN_COOKIE_NAME}=${expiresAt}.${signature}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(SESSION_DURATION_MS / 1000)}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

/** 로그아웃할 때 쿠키를 지우는 Set-Cookie 값. */
export function clearSessionCookie(secure: boolean): string {
  return [
    `${ADMIN_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');

    if (separator === -1) {
      continue;
    }

    if (part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }

  return null;
}

/** 요청에 실린 관리자 쿠키가 유효한지. */
export async function hasValidSession(
  request: Request,
  password: string,
): Promise<boolean> {
  const raw = readCookie(request.headers.get('cookie'), ADMIN_COOKIE_NAME);

  if (!raw) {
    return false;
  }

  const separator = raw.lastIndexOf('.');

  if (separator === -1) {
    return false;
  }

  const expiresAt = Number(raw.slice(0, separator));
  const signature = raw.slice(separator + 1);

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  return timingSafeEqual(signature, await sign(String(expiresAt), password));
}

/** https 로 서비스될 때만 Secure 를 붙인다. 로컬 http 개발에서도 쿠키가 살아야 한다. */
export function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === 'https:';
}
