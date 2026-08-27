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

  // github.com이 아닌 도메인은 owner/repo 표기로도 받아주지 않는다.
  if (trimmed.includes("://") || trimmed.includes(".")) return null;

  const bareMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  return bareMatch ? `${bareMatch[1]}/${bareMatch[2]}` : null;
}
