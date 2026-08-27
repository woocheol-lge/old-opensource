/**
 * 대체 오픈소스를 찾을 근거를 정한다.
 * 토픽이 있으면 토픽을, 없으면 설명의 핵심어를 쓴다.
 * 어느 쪽이든 화면에 근거를 밝혀 사용자가 걸러낼 수 있게 한다.
 */

export type AlternativeBasis =
  | { kind: "topic"; topic: string }
  | { kind: "keyword"; keywords: string[] };

/** 설명에서 걷어낼 흔한 말. 프로젝트를 구분해주지 못한다. */
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "based", "by", "designed",
  "for", "from", "in", "intended", "is", "it", "its", "meant", "of", "on",
  "or", "provide", "provides", "support", "supports", "that", "the", "this",
  "to", "use", "used", "using", "was", "with", "written",
]);

const MIN_WORD_LENGTH = 3;
const MAX_KEYWORDS = 3;

/**
 * 형태나 포장을 가리키는 일반 명사로 끝나는 토픽은 걸러낸다.
 * "usb-devices"(298개)는 "usb-cdc"(126개)보다 글자 수는 길어도 실제로는
 * 훨씬 넓은 토픽이다. 반면 "usb-cdc", "usb-hid"처럼 기술 용어로 끝나는
 * 토픽은 실제로 좁다. 매번 GitHub에 개수를 물어보면 검색 한도를 쓰므로
 * 대신 흔한 꼬리 단어를 걸러내는 쪽을 쓴다.
 */
const GENERIC_TOPIC_TAILS = new Set([
  "device", "devices", "drive", "drives", "tool", "tools",
  "app", "apps", "application", "applications",
  "library", "libraries", "utility", "utilities",
  "software", "framework", "frameworks",
  "project", "projects", "kit", "stack",
  "plugin", "plugins", "extension", "extensions",
  "package", "packages", "module", "modules",
]);

function hasGenericTail(topic: string): boolean {
  const segments = topic.split("-");
  return GENERIC_TOPIC_TAILS.has(segments[segments.length - 1]);
}

/** 하이픈으로 나눈 단어가 많을수록 구체적인 토픽으로 본다. */
function specificity(topic: string): [number, number] {
  return [topic.split("-").length, topic.length];
}

function pickTopic(topics: string[], exclude: string): string | null {
  const usable = topics.filter(
    (topic) => topic.toLowerCase() !== exclude.toLowerCase()
  );
  if (usable.length === 0) return null;

  const specific = usable.filter((topic) => !hasGenericTail(topic));
  if (specific.length > 0) return reduceBySpecificity(specific);
  return reduceBySpecificity(usable);
}

function reduceBySpecificity(usable: string[]): string {
  return usable.reduce((best, topic) => {
    const [bw, bl] = specificity(best);
    const [tw, tl] = specificity(topic);
    if (tw !== bw) return tw > bw ? topic : best;
    if (tl !== bl) return tl > bl ? topic : best;
    return topic < best ? topic : best;
  });
}

/** 설명 문장에서 프로젝트를 구분해주는 낱말만 남긴다. */
export function extractKeywords(
  description: string,
  exclude: string
): string[] {
  const excluded = exclude.toLowerCase();

  return description
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter(
      (word) =>
        word.length >= MIN_WORD_LENGTH &&
        !STOP_WORDS.has(word) &&
        !excluded.includes(word) &&
        !word.includes(excluded)
    )
    .slice(0, MAX_KEYWORDS);
}

type BasisCandidate = {
  topics: string[];
  description: string | null;
  stars: number;
};

/**
 * "Newlib is a C library ..."처럼 프로젝트를 정의하는 문장인지 본다.
 * 미러와 포팅의 설명은 원본이 무엇인지 알려주지 않으므로 이 문장을 우선한다.
 */
function definesProject(description: string | null, name: string): boolean {
  if (!description) return false;

  // 검색어에 정규식 특수문자가 들어올 수 있다. c++ 같은 이름이 그렇다.
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^\\s*${escaped}\\s+is\\s+(a|an|the)\\b`, "i");
  return pattern.test(description);
}

/**
 * 근거로 삼을 대표 후보를 고른다.
 * 프로젝트를 정의하는 설명을 가진 후보를 먼저 보고,
 * 없으면 별이 가장 많은 후보로 물러선다.
 */
function pickLeader(
  candidates: BasisCandidate[],
  searchName: string
): BasisCandidate | null {
  const byStars = [...candidates].sort((a, b) => b.stars - a.stars);
  const defining = byStars.find((candidate) =>
    definesProject(candidate.description, searchName)
  );

  return defining ?? byStars[0] ?? null;
}

/** 대체 오픈소스를 찾을 근거를 정한다. 토픽이 있으면 토픽을 우선한다. */
export function chooseBasis(
  candidates: BasisCandidate[],
  searchName: string
): AlternativeBasis | null {
  const withTopics = [...candidates]
    .sort((a, b) => b.stars - a.stars)
    .find((candidate) => pickTopic(candidate.topics, searchName));
  if (withTopics) {
    const topic = pickTopic(withTopics.topics, searchName);
    if (topic) return { kind: "topic", topic };
  }

  const leader = pickLeader(candidates, searchName);
  if (!leader) return null;

  const keywords = extractKeywords(leader.description ?? "", searchName);
  return keywords.length > 0 ? { kind: "keyword", keywords } : null;
}

/** 근거를 GitHub 검색 질의로 바꾼다. */
export function buildQuery(basis: AlternativeBasis): string {
  return basis.kind === "topic"
    ? `topic:${basis.topic}`
    : basis.keywords.join(" ");
}

/** 화면에 밝힐 근거 문구. */
export function describeBasis(basis: AlternativeBasis): string {
  return basis.kind === "topic"
    ? `토픽 ${basis.topic}`
    : `설명의 핵심어 ${basis.keywords.join(", ")}`;
}
