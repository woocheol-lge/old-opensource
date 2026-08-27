/** 목록에 올릴 후보 레포지토리 수. 한 화면에서 골라낼 수 있는 분량으로 정했다. */
export const CANDIDATE_LIMIT = 10;

const API_ROOT = "https://api.github.com";

export type GithubSearchItem = {
  full_name: string;
  name: string;
  owner: { login: string };
  html_url: string;
  description: string | null;
  created_at: string;
  default_branch: string;
  stargazers_count: number;
  topics?: string[];
  license: { spdx_id: string | null; name: string } | null;
};

export class RateLimitedError extends Error {
  constructor() {
    super("GitHub API 요청 한도를 초과했습니다.");
    this.name = "RateLimitedError";
  }
}

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function isRateLimited(response: Response): boolean {
  if (response.status !== 403 && response.status !== 429) return false;
  return response.headers.get("x-ratelimit-remaining") === "0";
}

async function request(path: string): Promise<Response> {
  const response = await fetch(`${API_ROOT}${path}`, { headers: headers() });
  if (isRateLimited(response)) throw new RateLimitedError();
  return response;
}

/**
 * 이름이 일치하는 레포지토리를 GitHub 기본 정렬로 찾는다.
 * `in:name`으로 좁히지 않으면 설명에만 이름이 언급된 레포지토리가 섞인다.
 */
async function searchRepositories(
  query: string,
  perPage: number,
  sort?: "stars"
): Promise<GithubSearchItem[]> {
  const params = new URLSearchParams({ q: query, per_page: String(perPage) });
  if (sort) {
    params.set("sort", sort);
    params.set("order", "desc");
  }

  const response = await request(`/search/repositories?${params}`);
  if (!response.ok) {
    throw new Error(`GitHub 검색에 실패했습니다. (${response.status})`);
  }

  const body = (await response.json()) as { items?: GithubSearchItem[] };
  return body.items ?? [];
}

export async function searchByName(name: string): Promise<GithubSearchItem[]> {
  return searchRepositories(`${name} in:name`, CANDIDATE_LIMIT);
}

/** 목록에 올릴 대체 오픈소스 수. 후보 목록보다 짧게 둔다. */
export const ALTERNATIVE_LIMIT = 5;

/**
 * 대체 오픈소스를 별 개수 순으로 찾는다.
 * 같은 이름의 레포지토리는 이미 후보 목록에 있으므로 걸러낼 몫을 남겨
 * 필요한 수보다 넉넉히 받아 온다.
 */
export async function searchAlternatives(
  query: string
): Promise<GithubSearchItem[]> {
  return searchRepositories(query, ALTERNATIVE_LIMIT * 3, "stars");
}
