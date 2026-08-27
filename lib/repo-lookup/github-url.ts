/**
 * 사용자가 붙여넣은 GitHub 링크 또는 `owner/repo` 표기에서
 * `owner/repo`를 뽑아낸다. 알아볼 수 없으면 null을 돌려준다.
 */
export function parseGithubFullName(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s?#]+)\/([^/\s?#]+)/i
  );
  if (urlMatch) {
    const owner = urlMatch[1];
    const name = urlMatch[2].replace(/\.git$/i, "");
    return owner && name ? `${owner}/${name}` : null;
  }

  // 명시적인 URL 스킴이 있는데 github.com이 아니면 다른 사이트다.
  if (trimmed.includes("://")) return null;

  const bareMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (!bareMatch) return null;

  // owner 자리가 도메인처럼 보이면(점 포함) github.com 아닌 사이트로 본다.
  // repo 이름 자체에 점이 있는 것(예: underscore.js)은 막지 않는다.
  if (bareMatch[1].includes(".")) return null;

  return `${bareMatch[1]}/${bareMatch[2]}`;
}
