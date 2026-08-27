import { lookupRepository } from "@/lib/repo-lookup";
import { AlternativeList } from "./alternative-list";
import { CandidateCard } from "./candidate-card";
import { Notice } from "./notice";

/**
 * 입력값 하나로 이름 검색 목록과 링크 확인 결과를 함께 다룬다.
 * `owner/repo` 표기나 GitHub 링크면 정확히 하나(single), 그 외에는
 * 이름으로 찾은 후보 여러 개(list)를 보여준다.
 */
export async function RepoResults({ input }: { input: string }) {
  const result = await lookupRepository(input);

  if (result.status === "rate-limited") {
    return (
      <Notice>
        GitHub 검색 요청이 잠시 몰렸습니다. 분당 10회까지 쓸 수 있으니, 잠깐
        기다렸다가 다시 시도해 주세요.
      </Notice>
    );
  }

  if (result.status === "failed") {
    return <Notice>{result.message} 잠시 뒤에 다시 시도해 주세요.</Notice>;
  }

  if (result.mode === "single") {
    if (result.status === "invalid-url") {
      // lookupRepository가 이미 owner/repo 형태를 확인한 뒤에만 single로
      // 분기하므로 이 상태는 실제로는 발생하지 않는다.
      return null;
    }

    if (result.status === "not-found") {
      return (
        <Notice>
          <strong className="text-foreground">잘못된 링크입니다.</strong>{" "}
          <span className="text-foreground">{input}</span>을(를) GitHub에서
          확인하지 못했습니다. 정확한지 다시 봐 주시고, 레포지토리 이름에
          점(.)이 있으면 GitHub 검색이 그 이름을 이 방식으로는 찾지 못하는
          경우가 있습니다.
        </Notice>
      );
    }

    if (result.status === "empty") return null;

    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-mono">owner/repo</span> 표기로 정확히
            지정한 레포지토리입니다.
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

  if (result.status === "empty") {
    return (
      <Notice>
        <strong className="text-foreground">{input}</strong>라는 이름의
        레포지토리를 찾지 못했습니다. 철자를 확인하거나 다른 이름으로
        찾아보세요.
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
