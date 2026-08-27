import { Button } from "@/components/ui/button";

export function RepoUrlForm({
  defaultValue,
  queryDefaultValue,
}: {
  defaultValue?: string;
  /** 이름 검색 상태. 이 폼을 제출해도 잃지 않는다. */
  queryDefaultValue?: string;
}) {
  return (
    <form
      action="/"
      method="get"
      className="flex w-full flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2"
    >
      <label htmlFor="repo" className="sr-only">
        GitHub 링크로 바로 확인
      </label>
      <input
        id="repo"
        name="repo"
        type="text"
        defaultValue={defaultValue}
        placeholder="이미 아는 레포지토리라면 GitHub 링크 (예: https://github.com/owner/repo)"
        className="h-10 flex-1 rounded-md border border-dashed border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {queryDefaultValue ? (
        <input type="hidden" name="q" value={queryDefaultValue} />
      ) : null}
      <Button type="submit" variant="outline" size="lg">
        링크로 확인
      </Button>
    </form>
  );
}
