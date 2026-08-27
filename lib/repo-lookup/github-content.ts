/**
 * github.com이 API 밖으로 열어둔 경로에서 레포지토리 내용을 가져온다.
 * 검색과 달리 시간당 60회 한도에 걸리지 않으므로 후보 수만큼 불러도 된다.
 * 대신 문서화된 계약이 아니라서 GitHub이 바꾸면 깨질 수 있다.
 */

const SITE_ROOT = "https://github.com";
const RAW_ROOT = "https://raw.githubusercontent.com";

/** 흔한 순서대로 시도할 README 파일명. API의 /readme와 달리 직접 찾아야 한다. */
const README_NAMES = [
  "README.md",
  "README",
  "readme.md",
  "README.rst",
  "README.txt",
];

/** 커밋 Atom 피드에서 가장 최근 항목의 시각을 뽑는다. */
export function parseLatestCommitDate(atom: string): string | null {
  const entry = atom.match(/<entry>([\s\S]*?)<\/entry>/);
  if (!entry) return null;

  const updated = entry[1].match(/<updated>([^<]+)<\/updated>/);
  return updated ? updated[1].trim() : null;
}

/**
 * 기본 브랜치의 마지막 커밋 날짜를 가져온다.
 * 검색 응답의 `pushed_at`은 다른 브랜치 push에도 갱신되므로 쓰지 않는다.
 * 가져오지 못하면 null을 돌려주고 호출한 쪽에서 "확인 불가"로 다룬다.
 */
export async function fetchLastCommitDate(
  fullName: string,
  defaultBranch: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${SITE_ROOT}/${fullName}/commits/${defaultBranch}.atom`
    );
    if (!response.ok) return null;

    return parseLatestCommitDate(await response.text());
  } catch {
    return null;
  }
}

/**
 * README 원문을 가져온다. 파일명을 알 수 없으므로 후보를 한꺼번에 시도하고
 * 우선순위가 가장 높은 응답을 쓴다. 하나도 없으면 null이다.
 */
export async function fetchReadme(
  fullName: string,
  defaultBranch: string
): Promise<string | null> {
  const attempts = await Promise.all(
    README_NAMES.map(async (fileName) => {
      try {
        const response = await fetch(
          `${RAW_ROOT}/${fullName}/${defaultBranch}/${fileName}`
        );
        return response.ok ? await response.text() : null;
      } catch {
        return null;
      }
    })
  );

  return attempts.find((content) => content !== null) ?? null;
}
