import type { RepositoryCandidate } from "@/lib/repo-lookup";
import { cn } from "@/lib/utils";
import { WarningBadge } from "./warning-badge";

function formatDate(iso: string | null): string {
  if (!iso) return "확인 불가";
  return iso.slice(0, 10);
}

export function CandidateCard({
  candidate,
}: {
  candidate: RepositoryCandidate;
}) {
  return (
    <li
      data-repo={candidate.fullName}
      className="rounded-lg border border-border bg-background p-4"
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <a
          href={candidate.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline-offset-4 hover:underline"
        >
          <span className="text-muted-foreground">{candidate.owner}</span>
          <span className="text-muted-foreground">/</span>
          <span>{candidate.name}</span>
        </a>
        <WarningBadge level={candidate.warningLevel} />
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {candidate.description ?? "설명이 없습니다."}
      </p>

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">마지막 업데이트</dt>
          <dd
            data-field="last-update"
            className="font-medium tabular-nums"
          >
            {formatDate(candidate.lastUpdate)}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">생성일</dt>
          <dd className="tabular-nums">{formatDate(candidate.createdAt)}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">라이선스</dt>
          <dd
            data-field="license"
            className={cn(
              !candidate.license &&
                "font-medium text-red-700 dark:text-red-300"
            )}
          >
            {candidate.license ?? "라이선스 표기 없음"}
          </dd>
        </div>
      </dl>
    </li>
  );
}
