import { defineConfig, devices } from "@playwright/test";

// 3000 포트가 다른 프로세스에 잡혀 있을 때는 PLAYWRIGHT_BASE_URL로
// 이미 떠 있는 서버를 지정한다. 그 경우 webServer를 띄우지 않는다.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL ?? "http://localhost:3000";

// 브라우저가 이미 설치된 환경(예: Claude Code 원격 세션)에서는
// PLAYWRIGHT_CHROMIUM_PATH로 실행 파일을 직접 지정한다.
// 로컬에서는 비워 두고 `bunx playwright install chromium`으로 내려받는다.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: "bun run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
