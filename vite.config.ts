import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig, loadEnv } from 'vite';
import hostingConfig from './.openai/hosting.json';

/**
 * OpenAI Sites 로 배포하면 플랫폼이 이 자리에 실제 D1 을 꽂아 준다. 자기
 * Cloudflare 계정으로 직접 배포할 때는 그 과정이 없으므로 `.env` 의
 * `CF_*` 로 실제 값을 넣는다. `.env.example` 을 참고.
 */
const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  '00000000-0000-4000-8000-000000000000';

const SITE_CREATOR_DATABASE_NAME = 'site-creator-d1';

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'CF_');

  const localBindingConfig = {
    // 워커 이름이 배포 주소(<이름>.<계정>.workers.dev)가 된다. 비워 두면
    // package.json 의 이름을 쓴다.
    ...(env.CF_WORKER_NAME ? { name: env.CF_WORKER_NAME } : {}),
    main: 'vinext/server/fetch-handler',
    compatibility_flags: ['nodejs_compat'],
    d1_databases: d1
      ? [
          {
            binding: d1,
            database_name:
              env.CF_D1_DATABASE_NAME || SITE_CREATOR_DATABASE_NAME,
            database_id:
              env.CF_D1_DATABASE_ID || SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
            // `wrangler d1 migrations` 는 생성된 설정 파일
            // (dist/server/wrangler.json) 기준으로 경로를 푼다.
            migrations_dir: '../../migrations',
          },
        ]
      : [],
    r2_buckets: r2
      ? [
          {
            binding: r2,
            bucket_name: 'site-creator-r2',
          },
        ]
      : [],
  };

  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});
