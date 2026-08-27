import { Suspense } from "react";
import { RepoResults } from "@/components/repo-lookup/repo-results";
import { RepoUrlForm } from "@/components/repo-lookup/repo-url-form";
import { SearchForm } from "@/components/repo-lookup/search-form";
import { CAUTION_YEARS, DANGER_YEARS } from "@/lib/repo-lookup";

export default async function Home(props: PageProps<"/">) {
  const { q, repo } = await props.searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const repoInput = typeof repo === "string" ? repo.trim() : "";

  return (
    <div className="flex flex-1 justify-center bg-muted/30 px-6 py-16">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            오픈소스 상태 확인
          </h1>
          <p className="text-sm text-muted-foreground">
            쓰고 있는 오픈소스 이름을 넣으면 같은 이름의 레포지토리를 모아
            보여줍니다. 마지막 업데이트가 {CAUTION_YEARS}년을 넘으면 노란색,{" "}
            {DANGER_YEARS}년을 넘으면 빨간색으로 알립니다.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          <SearchForm defaultValue={query} />
          <RepoUrlForm defaultValue={repoInput} queryDefaultValue={query} />
        </div>

        {repoInput || query ? (
          <Suspense
            key={`${repoInput}:${query}`}
            fallback={
              <p role="status" className="text-sm text-muted-foreground">
                {repoInput || query} 레포지토리를 확인하는 중입니다.
              </p>
            }
          >
            <RepoResults query={query} repoInput={repoInput} />
          </Suspense>
        ) : (
          <p className="text-sm text-muted-foreground">
            확인할 오픈소스 이름을 입력해 주세요.
          </p>
        )}
      </main>
    </div>
  );
}
