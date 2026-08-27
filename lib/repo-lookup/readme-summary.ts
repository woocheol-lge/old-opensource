/** 설명 자리에 넣을 최대 길이. 넘치면 잘라내고 말줄임표를 붙인다. */
const MAX_LENGTH = 200;

/** 문단으로 인정할 최소 길이. 뱃지 잔해나 한 단어짜리 줄을 걸러낸다. */
const MIN_LENGTH = 20;

function stripCodeBlocks(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, " ");
}

/** 뱃지는 링크로 감싼 이미지다. 설명이 아니라 장식이므로 걷어낸다. */
function stripBadges(text: string): string {
  return text
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "");
}

/** 링크는 표시 문구만 남긴다. */
function unwrapLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

function stripInlineMarks(text: string): string {
  return text
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/__([^_]*)__/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/_([^_]*)_/g, "$1");
}

function isSkippable(line: string): boolean {
  return (
    line.length === 0 ||
    line.startsWith("#") ||
    line.startsWith(">") ||
    line.startsWith("---") ||
    line.startsWith("===") ||
    line.startsWith("|") ||
    /^[-*+]\s/.test(line) ||
    /^\d+\.\s/.test(line)
  );
}

/**
 * README 본문에서 프로젝트를 설명하는 첫 문단을 뽑는다.
 * 제목, 뱃지, 코드 블록, 목록, 표는 설명이 아니므로 건너뛴다.
 * 쓸 만한 문단이 없으면 null을 돌려준다.
 */
export function summarizeReadme(markdown: string): string | null {
  const cleaned = stripInlineMarks(
    unwrapLinks(stripBadges(stripHtml(stripCodeBlocks(markdown))))
  );

  for (const block of cleaned.split(/\n\s*\n/)) {
    const line = block.replace(/\s+/g, " ").trim();
    if (isSkippable(line) || line.length < MIN_LENGTH) continue;

    return line.length > MAX_LENGTH
      ? `${line.slice(0, MAX_LENGTH).trimEnd()}…`
      : line;
  }

  return null;
}
