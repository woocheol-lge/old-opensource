import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 검색 폼과 경고 기준 안내가 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("오픈소스 상태 확인");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "오픈소스 상태 확인"
  );
  await expect(page.getByRole("searchbox", { name: "오픈소스 이름" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "확인", exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("3년을 넘으면 노란색, 5년을 넘으면 빨간색")
  ).toBeVisible();
});

test("이미 아는 레포지토리는 GitHub 링크로 바로 확인할 수 있다", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("textbox", { name: "GitHub 링크로 바로 확인" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "링크로 확인" })
  ).toBeVisible();
});

test("이름을 넣지 않으면 입력을 안내한다", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByText("확인할 오픈소스 이름을 입력해 주세요")
  ).toBeVisible();
});
