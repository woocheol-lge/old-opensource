import type { Alternatives } from "@/lib/repo-lookup";
import { CandidateCard } from "./candidate-card";

export function AlternativeList({
  alternatives,
}: {
  alternatives: Alternatives;
}) {
  return (
    <section data-section="alternatives" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-medium">대체할 만한 오픈소스</h2>
        <p className="text-sm text-muted-foreground">
          {alternatives.basis}로 찾았습니다. 실제로 같은 일을 하는지는 직접
          확인해 주세요.
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {alternatives.repositories.map((repository) => (
          <CandidateCard key={repository.fullName} candidate={repository} />
        ))}
      </ul>
    </section>
  );
}
