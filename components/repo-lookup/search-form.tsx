import { Button } from "@/components/ui/button";

export function SearchForm({
  defaultValue,
  repoDefaultValue,
}: {
  defaultValue?: string;
  /** 링크로 직접 지정한 레포지토리 조회 상태. 이 검색을 다시 실행해도 잃지 않는다. */
  repoDefaultValue?: string;
}) {
  return (
    <form action="/" method="get" className="flex w-full gap-2">
      <label htmlFor="q" className="sr-only">
        오픈소스 이름
      </label>
      <input
        id="q"
        name="q"
        type="search"
        required
        defaultValue={defaultValue}
        placeholder="오픈소스 이름 (예: newlib)"
        className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {repoDefaultValue ? (
        <input type="hidden" name="repo" value={repoDefaultValue} />
      ) : null}
      <Button type="submit" size="lg">
        확인
      </Button>
    </form>
  );
}
