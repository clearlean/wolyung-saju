'use client';

/**
 * 관리자 신청서 목록.
 *
 * 이 화면에는 실명과 생년월일이 그대로 뜬다. 인증은 서버가 한다. 여기서는
 * 401 이 오면 로그인 폼을 보여 줄 뿐이고, 데이터는 세션이 유효할 때만 내려온다.
 */

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

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

type Status = 'checking' | 'locked' | 'ready';

export default function AdminPage() {
  const [status, setStatus] = useState<Status>('checking');
  const [rows, setRows] = useState<readonly SubmissionRow[]>([]);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/submissions');

    if (response.status === 401) {
      setStatus('locked');
      return;
    }

    const payload = (await response.json()) as {
      ok: boolean;
      rows?: SubmissionRow[];
      error?: string;
    };

    if (!payload.ok) {
      setStatus('locked');
      setMessage(payload.error ?? '불러오지 못했습니다.');
      return;
    }

    setRows(payload.rows ?? []);
    setMessage('');
    setStatus('ready');
  }, []);

  // 이미 로그인된 세션이 있으면 비밀번호를 다시 묻지 않도록 마운트할 때 한 번 확인한다.
  // 이 한 번의 setState 로 'checking' → 'locked' | 'ready' 렌더가 한 번 더 도는데,
  // 관리자 혼자 쓰는 화면이라 그대로 두었다.
  useEffect(() => {
    void load();
  }, [load]);

  const signIn = async () => {
    setBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!payload.ok) {
        setMessage(payload.error ?? '로그인에 실패했습니다.');
        return;
      }

      setPassword('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setRows([]);
    setStatus('locked');
  };

  const remove = async (row: SubmissionRow) => {
    const confirmed = window.confirm(
      `@${row.instagram} (${row.name}) 의 신청서를 지웁니다. 되돌릴 수 없습니다.`,
    );

    if (!confirmed) {
      return;
    }

    await fetch(
      `/api/admin/submissions?instagram=${encodeURIComponent(row.instagram)}`,
      { method: 'DELETE' },
    );

    await load();
  };

  return (
    <main className="admin-page">
      {/* 신청자 정보가 담긴 화면이라 검색엔진에 남으면 안 된다. */}
      <meta name="robots" content="noindex, nofollow" />

      <header className="admin-header">
        <h1 className="admin-title">신청서 관리</h1>
        {status === 'ready' && (
          <button type="button" onClick={signOut} className="admin-signout">
            로그아웃
          </button>
        )}
      </header>

      {status === 'checking' && (
        <p className="admin-note">확인하는 중입니다…</p>
      )}

      {status === 'locked' && (
        <form
          className="admin-login"
          onSubmit={(event) => {
            event.preventDefault();
            void signIn();
          }}
        >
          <label className="admin-label" htmlFor="admin-password">
            관리자 비밀번호
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="admin-input"
          />
          <Button type="submit" disabled={busy} className="admin-submit">
            {busy ? '확인 중…' : '들어가기'}
          </Button>
          {message && <p className="admin-error">{message}</p>}
        </form>
      )}

      {status === 'ready' && (
        <>
          <p className="admin-note">
            {rows.length}건. 최근 신청 순입니다. 보유 기간은 매칭 종료 후
            6개월이며, 삭제 요청이 오면 이 화면에서 바로 지울 수 있습니다.
          </p>

          {rows.length === 0 ? (
            <p className="admin-note">아직 신청서가 없습니다.</p>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">신청 시각</th>
                    <th scope="col">이름</th>
                    <th scope="col">인스타</th>
                    <th scope="col">성별</th>
                    <th scope="col">생년월일</th>
                    <th scope="col">태어난 시간</th>
                    <th scope="col">사주</th>
                    <th scope="col">동의</th>
                    <th scope="col">파기</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.instagram}>
                      <td>{row.created_at.slice(0, 16).replace('T', ' ')}</td>
                      <td>{row.name}</td>
                      <td>@{row.instagram}</td>
                      <td>{row.gender === 'male' ? '남' : '여'}</td>
                      <td>{row.birth_date}</td>
                      <td>{row.hour_known ? row.birth_time : '모름'}</td>
                      <td className="admin-pillars">
                        {[
                          row.hour_pillar ?? '—',
                          row.day_pillar,
                          row.month_pillar,
                          row.year_pillar,
                        ].join(' ')}
                      </td>
                      <td>{row.consent_version ?? '—'}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => void remove(row)}
                          className="admin-delete"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
