import type { PinnedLookupResult } from "@/lib/repo-lookup";
import { lookupRepositoryByUrl } from "@/lib/repo-lookup";
import { AlternativeList } from "./alternative-list";
import { CandidateCard } from "./candidate-card";
import { CandidateList } from "./candidate-list";
import { Notice } from "./notice";

function PinnedFailureNotice({
  result,
  input,
}: {
  result: Exclude<PinnedLookupResult, { status: "ok" | "empty" }>;
  input: string;
}) {
  if (result.status === "invalid-url") {
    return (
      <Notice>
        <strong className="text-foreground">잘못된 링크입니다.</strong>{" "}
        <span className="text-foreground">{input}</span>에서 GitHub
        레포지토리를 알아보지 못했습니다.{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          https://github.com/owner/repo
        </code>{" "}
        형태의 링크나{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          owner/repo
        </code>{" "}
        표기를 넣어 주세요.
      </Notice>
    );
  }

  if (result.status === "not-found") {
    return (
      <Notice>
        <strong className="text-foreground">잘못된 링크입니다.</strong>{" "}
        <span className="text-foreground">{input}</span>을(를) GitHub에서
        확인하지 못했습니다. 링크가 정확한지 다시 봐 주시고, 레포지토리
        이름에 점(.)이 있으면 GitHub 검색이 그 이름을 이 방식으로는 찾지
        못하는 경우가 있습니다.
      </Notice>
    );
  }

  if (result.status === "rate-limited") {
    return (
      <Notice>
        GitHub 검색 요청이 잠시 몰렸습니다. 잠깐 기다렸다가 다시 시도하거나
        GITHUB_TOKEN 환경변수를 설정해 주세요.
      </Notice>
    );
  }

  return <Notice>{result.message} 잠시 뒤에 다시 시도해 주세요.</Notice>;
}

/**
 * 이름 검색과 링크 확인을 한 곳에서 조율한다.
 * 링크로 정확한 레포지토리를 찾았으면(status "ok") 그것만 보여주고,
 * 애매한 이름 검색 목록은 보여주지 않는다 — 이미 정확히 찾았기 때문이다.
 * 링크가 없거나 실패했을 때만 이름 검색 결과로 넘어간다.
 */
export async function RepoResults({
  query,
  repoInput,
}: {
  query: string;
  repoInput: string;
}) {
  if (repoInput) {
    const pinned = await lookupRepositoryByUrl(repoInput);

    if (pinned.status === "ok") {
      return (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              링크로 직접 지정한 레포지토리입니다.
            </p>
            <ul className="flex flex-col gap-3">
              <CandidateCard candidate={pinned.candidate} />
            </ul>
          </div>
          {pinned.alternatives ? (
            <AlternativeList alternatives={pinned.alternatives} />
          ) : null}
        </div>
      );
    }

    if (pinned.status === "empty") {
      // repoInput은 있는데 빈 문자열로 정리된 경우. 실제로는 페이지에서
      // repoInput을 이미 trim하므로 거의 발생하지 않는다.
      return query ? <CandidateList query={query} /> : null;
    }

    return (
      <div className="flex flex-col gap-6">
        <PinnedFailureNotice result={pinned} input={repoInput} />
        {query ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              링크는 확인하지 못해, 오픈소스 이름으로만 검색된 결과입니다.
            </p>
            <CandidateList query={query} />
          </div>
        ) : null}
      </div>
    );
  }

  if (query) return <CandidateList query={query} />;

  return null;
}
