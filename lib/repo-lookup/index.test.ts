import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupRepositories, lookupRepositoryByUrl } from "./index";

const NOW = new Date("2026-08-27T00:00:00Z");

function searchItem(fullName: string) {
  const [owner, name] = fullName.split("/");
  return {
    full_name: fullName,
    name,
    owner: { login: owner },
    html_url: `https://github.com/${fullName}`,
    description: `${name} 설명`,
    created_at: "2020-01-01T00:00:00Z",
    default_branch: "main",
    stargazers_count: 10,
    topics: ["widget-toolkit"],
    license: { spdx_id: "MIT", name: "MIT License" },
  };
}

function atomFeed(date: string) {
  return `<feed><entry><updated>${date}</updated></entry></feed>`;
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

function rateLimitedResponse() {
  return new Response("{}", {
    status: 403,
    headers: { "x-ratelimit-remaining": "0" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lookupRepositories: 대체 검색 실패 격리", () => {
  it("대체 오픈소스 검색이 한도 초과로 실패해도 이미 찾은 후보 목록은 그대로 보여준다", async () => {
    const primary = [searchItem("acme/widget")];

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/search/repositories")) {
        // in:name이 붙은 첫 검색은 후보 검색, 그 외는 대체 오픈소스 검색이다.
        if (url.includes("in%3Aname") || url.includes("in:name")) {
          return jsonResponse({ items: primary });
        }
        return rateLimitedResponse();
      }

      if (url.includes("/commits/")) {
        return new Response(atomFeed("2026-08-20T00:00:00Z"), { status: 200 });
      }

      throw new Error(`예상하지 못한 호출: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await lookupRepositories("widget", NOW);

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.candidates).toHaveLength(1);
      expect(result.candidates[0].fullName).toBe("acme/widget");
      expect(result.alternatives).toBeNull();
    }
  });

  it("대체 오픈소스 검색을 찾으면 후보 목록과 함께 보여준다", async () => {
    const primary = [searchItem("acme/widget")];
    const alt = [searchItem("other/gizmo")];

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/search/repositories")) {
        if (url.includes("in%3Aname") || url.includes("in:name")) {
          return jsonResponse({ items: primary });
        }
        return jsonResponse({ items: alt });
      }

      if (url.includes("/commits/")) {
        return new Response(atomFeed("2026-08-20T00:00:00Z"), { status: 200 });
      }

      throw new Error(`예상하지 못한 호출: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await lookupRepositories("widget", NOW);

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.candidates).toHaveLength(1);
      expect(result.alternatives?.repositories.map((r) => r.fullName)).toEqual([
        "other/gizmo",
      ]);
    }
  });

  it("후보 검색 자체가 한도 초과면 여전히 rate-limited로 실패한다", async () => {
    const fetchMock = vi.fn(async () => rateLimitedResponse());
    vi.stubGlobal("fetch", fetchMock);

    const result = await lookupRepositories("widget", NOW);

    expect(result.status).toBe("rate-limited");
  });
});

describe("lookupRepositoryByUrl: 알고 있는 레포지토리 직접 지정", () => {
  it("GitHub 링크로 레포지토리 하나를 정확히 찾는다", async () => {
    const item = searchItem("acme/widget");

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/search/repositories")) {
        expect(url).toContain(encodeURIComponent("repo:acme/widget"));
        return jsonResponse({ items: [item] });
      }
      if (url.includes("/commits/")) {
        return new Response(atomFeed("2026-08-20T00:00:00Z"), { status: 200 });
      }

      throw new Error(`예상하지 못한 호출: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await lookupRepositoryByUrl(
      "https://github.com/acme/widget",
      NOW
    );

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.candidate.fullName).toBe("acme/widget");
    }
  });

  it("알아볼 수 없는 링크는 invalid-url을 돌려준다", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("호출되면 안 된다");
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await lookupRepositoryByUrl("이건 링크가 아니다", NOW);

    expect(result.status).toBe("invalid-url");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("존재하지 않는 레포지토리는 not-found를 돌려준다", async () => {
    const fetchMock = vi.fn(
      async () => new Response("{}", { status: 422 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await lookupRepositoryByUrl(
      "https://github.com/nobody/nothing",
      NOW
    );

    expect(result.status).toBe("not-found");
  });

  it("한도 초과면 rate-limited를 돌려준다", async () => {
    const fetchMock = vi.fn(async () => rateLimitedResponse());
    vi.stubGlobal("fetch", fetchMock);

    const result = await lookupRepositoryByUrl(
      "https://github.com/acme/widget",
      NOW
    );

    expect(result.status).toBe("rate-limited");
  });
});
