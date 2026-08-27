import { describe, expect, it } from "vitest";
import { parseLatestCommitDate } from "./github-content";

describe("parseLatestCommitDate", () => {
  it("첫 entry의 시각을 뽑는다", () => {
    // anza-xyz/newlib 피드에서 잘라낸 실제 구조.
    const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Recent Commits to newlib:bpf-port</title>
  <updated>2026-08-24T00:00:00Z</updated>
  <entry>
    <title>[SOL] Add explicit declarations</title>
    <updated>2023-10-20T15:18:15Z</updated>
  </entry>
  <entry>
    <title>이전 커밋</title>
    <updated>2023-09-01T00:00:00Z</updated>
  </entry>
</feed>`;

    // 피드 자체의 updated가 아니라 첫 커밋의 시각이어야 한다.
    expect(parseLatestCommitDate(atom)).toBe("2023-10-20T15:18:15Z");
  });

  it("커밋이 없는 피드는 null을 돌려준다", () => {
    expect(
      parseLatestCommitDate(`<feed><updated>2026-01-01T00:00:00Z</updated></feed>`)
    ).toBeNull();
  });

  it("피드가 아닌 응답도 null로 다룬다", () => {
    expect(parseLatestCommitDate("<html>Not Found</html>")).toBeNull();
  });
});
