import { lookupRepositories } from "@/lib/repo-lookup";
import { AlternativeList } from "./alternative-list";
import { CandidateCard } from "./candidate-card";

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground"
    >
      {children}
    </p>
  );
}

export async function CandidateList({ query }: { query: string }) {
  const result = await lookupRepositories(query);

  if (result.status === "rate-limited") {
    return (
      <Notice>
        GitHub 검색 요청이 잠시 몰렸습니다. 비인증 상태에서는 검색을 분당
        10회까지 쓸 수 있습니다. 잠깐 기다렸다가 다시 시도하거나 GITHUB_TOKEN
        환경변수를 설정해 주세요.
      </Notice>
    );
  }

  if (result.status === "failed") {
    return <Notice>{result.message} 잠시 뒤에 다시 시도해 주세요.</Notice>;
  }

  if (result.status === "empty") {
    return (
      <Notice>
        <strong className="text-foreground">{query}</strong>라는 이름의
        레포지토리를 찾지 못했습니다. 철자를 확인하거나 다른 이름으로 찾아보세요.
      </Notice>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          이름이 일치하는 레포지토리 {result.candidates.length}개입니다. owner를
          보고 쓰시는 것을 골라 주세요.
        </p>
        <ul className="flex flex-col gap-3">
          {result.candidates.map((candidate) => (
            <CandidateCard key={candidate.fullName} candidate={candidate} />
          ))}
        </ul>
      </div>

      {result.alternatives ? (
        <AlternativeList alternatives={result.alternatives} />
      ) : null}
    </div>
  );
}
