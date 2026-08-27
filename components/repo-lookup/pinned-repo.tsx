import { lookupRepositoryByUrl } from "@/lib/repo-lookup";
import { AlternativeList } from "./alternative-list";
import { CandidateCard } from "./candidate-card";
import { Notice } from "./notice";

/** 사용자가 링크로 직접 지정한 레포지토리 하나를 확인하는 영역. */
export async function PinnedRepo({ input }: { input: string }) {
  const result = await lookupRepositoryByUrl(input);

  if (result.status === "empty") return null;

  if (result.status === "invalid-url") {
    return (
      <Notice>
        <strong className="text-foreground">{input}</strong>에서 GitHub
        레포지토리를 알아보지 못했습니다.{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          https://github.com/owner/repo
        </code>{" "}
        형태의 링크나 <code className="rounded bg-muted px-1 py-0.5 text-xs">owner/repo</code> 표기를 넣어 주세요.
      </Notice>
    );
  }

  if (result.status === "not-found") {
    return (
      <Notice>
        <strong className="text-foreground">{input}</strong>에 해당하는
        레포지토리를 GitHub에서 찾지 못했습니다. 링크를 다시 확인해 주세요.
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

  if (result.status === "failed") {
    return <Notice>{result.message} 잠시 뒤에 다시 시도해 주세요.</Notice>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          링크로 직접 지정한 레포지토리입니다.
        </p>
        <ul className="flex flex-col gap-3">
          <CandidateCard candidate={result.candidate} />
        </ul>
      </div>

      {result.alternatives ? (
        <AlternativeList alternatives={result.alternatives} />
      ) : null}
    </div>
  );
}
