import { buildQuery, chooseBasis, describeBasis } from "./alternatives";
import { fetchLastCommitDate, fetchReadme } from "./github-content";
import {
  ALTERNATIVE_LIMIT,
  CANDIDATE_LIMIT,
  type GithubSearchItem,
  RateLimitedError,
  searchAlternatives,
  searchByName,
} from "./github-search";
import { summarizeReadme } from "./readme-summary";
import { type WarningLevel, warningLevelFor } from "./staleness";

export { ALTERNATIVE_LIMIT, CANDIDATE_LIMIT } from "./github-search";
export {
  CAUTION_YEARS,
  DANGER_YEARS,
  type WarningLevel,
} from "./staleness";

/** 화면에 올라가는 후보 레포지토리 한 건. */
export type RepositoryCandidate = {
  fullName: string;
  owner: string;
  name: string;
  url: string;
  /** GitHub description. 비어 있으면 README 첫 문단으로 메운다. */
  description: string | null;
  /** SPDX 식별자. GitHub에 라이선스 정보가 없으면 null. */
  license: string | null;
  createdAt: string;
  /** 기본 브랜치의 마지막 커밋 날짜. 조회하지 못하면 null. */
  lastUpdate: string | null;
  warningLevel: WarningLevel;
};

/** 목록 전체에 대해 한 번 찾은 대체 오픈소스와 그 근거. */
export type Alternatives = {
  /** 어떤 근거로 찾았는지 화면에 밝힐 문구. */
  basis: string;
  repositories: RepositoryCandidate[];
};

export type LookupResult =
  | {
      status: "ok";
      candidates: RepositoryCandidate[];
      alternatives: Alternatives | null;
    }
  | { status: "empty" }
  | { status: "rate-limited" }
  | { status: "failed"; message: string };

/** 검색 결과 한 건을 화면에 올릴 후보로 바꾼다. */
async function toCandidate(
  item: GithubSearchItem,
  now: Date
): Promise<RepositoryCandidate> {
  const [lastUpdate, description] = await Promise.all([
    fetchLastCommitDate(item.full_name, item.default_branch),
    describe(item),
  ]);

  return {
    fullName: item.full_name,
    owner: item.owner.login,
    name: item.name,
    url: item.html_url,
    description,
    license: item.license?.spdx_id ?? null,
    createdAt: item.created_at,
    lastUpdate,
    warningLevel: warningLevelFor(
      lastUpdate ? new Date(lastUpdate) : null,
      now
    ),
  };
}

/**
 * 대체 오픈소스를 목록 전체에 대해 한 번만 찾는다.
 * 후보 10개가 대개 같은 프로젝트의 fork와 미러라서 각각 따로 찾을 이유가 없고,
 * 그렇게 하면 검색 한도를 한 번에 소진한다.
 *
 * 대체 검색은 부가 기능이라 실패해도 후보 목록까지 함께 실패시키지 않는다.
 * 실패 원인을 가리지 않고 null(대체 없음)로 물러선다 — 이미 성공한 후보
 * 목록을 대체 검색의 한도 초과나 일시적 오류 때문에 버리지 않기 위해서다.
 */
async function findAlternatives(
  items: GithubSearchItem[],
  searchName: string,
  now: Date
): Promise<Alternatives | null> {
  try {
    const basis = chooseBasis(
      items.map((item) => ({
        topics: item.topics ?? [],
        description: item.description,
        stars: item.stargazers_count,
      })),
      searchName
    );
    if (!basis) return null;

    const found = await searchAlternatives(buildQuery(basis));
    const excluded = new Set(items.map((item) => item.full_name));
    const picked = found
      .filter((item) => !excluded.has(item.full_name))
      .slice(0, ALTERNATIVE_LIMIT);

    if (picked.length === 0) return null;

    return {
      basis: describeBasis(basis),
      repositories: await Promise.all(
        picked.map((item) => toCandidate(item, now))
      ),
    };
  } catch {
    return null;
  }
}

/**
 * 용도 설명을 정한다. GitHub description을 우선하고,
 * 비어 있을 때만 README를 읽어 첫 문단으로 메운다.
 */
async function describe(item: {
  full_name: string;
  default_branch: string;
  description: string | null;
}): Promise<string | null> {
  const description = item.description?.trim();
  if (description) return description;

  const readme = await fetchReadme(item.full_name, item.default_branch);
  return readme ? summarizeReadme(readme) : null;
}

/**
 * 오픈소스 이름으로 후보 레포지토리를 찾아 유지보수 상태를 붙인다.
 * 한도가 걸리는 GitHub API 호출은 검색 1회뿐이고,
 * 커밋 날짜와 README는 한도 밖 경로에서 가져온다.
 */
export async function lookupRepositories(
  rawName: string,
  now: Date = new Date()
): Promise<LookupResult> {
  const name = rawName.trim();
  if (!name) return { status: "empty" };

  try {
    const items = await searchByName(name);
    if (items.length === 0) return { status: "empty" };

    const chosen = items.slice(0, CANDIDATE_LIMIT);
    const [candidates, alternatives] = await Promise.all([
      Promise.all(chosen.map((item) => toCandidate(item, now))),
      findAlternatives(chosen, name, now),
    ]);

    return { status: "ok", candidates, alternatives };
  } catch (error) {
    if (error instanceof RateLimitedError) return { status: "rate-limited" };
    const message =
      error instanceof Error ? error.message : "레포지토리를 불러오지 못했습니다.";
    return { status: "failed", message };
  }
}
