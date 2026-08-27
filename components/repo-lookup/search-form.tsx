import { Button } from "@/components/ui/button";

/**
 * 이름 검색은 링크 확인 값을 가져오지 않는다. "확인"을 누르는 건 이름으로
 * 새로 찾겠다는 의도라서, 이전에 실패했거나 남아 있는 링크 값을 계속
 * 실어 보내면 원치 않는 "잘못된 링크입니다"가 되풀이해서 따라붙는다.
 */
export function SearchForm({ defaultValue }: { defaultValue?: string }) {
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
      <Button type="submit" size="lg">
        확인
      </Button>
    </form>
  );
}
