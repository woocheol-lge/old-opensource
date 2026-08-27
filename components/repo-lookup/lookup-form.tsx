import { Button } from "@/components/ui/button";

export function LookupForm({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/" method="get" className="flex w-full gap-2">
      <label htmlFor="q" className="sr-only">
        오픈소스 이름 또는 owner/repo
      </label>
      <input
        id="q"
        name="q"
        type="search"
        required
        autoComplete="off"
        defaultValue={defaultValue}
        placeholder="오픈소스 이름 또는 owner/repo (예: newlib, anza-xyz/newlib)"
        className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <Button type="submit" size="lg">
        확인
      </Button>
    </form>
  );
}
