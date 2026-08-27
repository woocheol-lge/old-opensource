# public/에 참조를 잃은 템플릿 SVG 자산이 남아 있다

**Symptom**: `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg`가 어디에서도 쓰이지 않은 채 배포 산출물에 포함된다.

**Observed evidence**: 2026-08-27, `repo-status-lookup` 구현 직후. `grep -rn "next.svg\|vercel.svg" app components lib e2e`가 아무것도 찾지 못한다. `bun run build`는 정상 통과하므로 빌드가 깨지지는 않는다.

**Suspected cause**: `app/page.tsx`가 create-next-app 기본 화면을 쓸 때 `next/image`로 `next.svg`와 `vercel.svg`를 불러왔는데, 이번 변경에서 그 화면을 통째로 교체하면서 자산만 남았다. 나머지 세 개는 템플릿 생성 시점부터 참조가 없었던 것으로 보인다.

**What was tried**: 손대지 않았다. 수용 기준이나 주 경로를 깨지 않아 AGENTS.md의 검증 예산에 따라 후속으로 미뤘다. 화면 동작과 빌드는 그대로다.

**Proposed next step**: `public/`의 다섯 SVG 각각에 대해 저장소 전체에서 참조를 다시 확인하고, 없는 것을 지운 뒤 `bun run build`와 `bun run test:e2e`로 확인한다.
