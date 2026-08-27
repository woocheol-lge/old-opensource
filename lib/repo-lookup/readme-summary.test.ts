import { describe, expect, it } from "vitest";
import { summarizeReadme } from "./readme-summary";

describe("summarizeReadme", () => {
  it("제목을 건너뛰고 첫 설명 문단을 뽑는다", () => {
    const readme = `# newlib

Newlib is a C library intended for use on embedded systems.

## Installation`;

    expect(summarizeReadme(readme)).toBe(
      "Newlib is a C library intended for use on embedded systems."
    );
  });

  it("뱃지 줄을 설명으로 착각하지 않는다", () => {
    const readme = `# project

[![Build](https://img.shields.io/badge/build-passing.svg)](https://ci.example.com)
[![npm](https://img.shields.io/npm/v/pkg.svg)](https://npmjs.com/pkg)

A tiny HTTP client for constrained devices.`;

    expect(summarizeReadme(readme)).toBe(
      "A tiny HTTP client for constrained devices."
    );
  });

  it("코드 블록과 HTML을 건너뛴다", () => {
    const readme = `<h1 align="center">tool</h1>

\`\`\`bash
npm install tool
\`\`\`

Generates typed clients from an OpenAPI document.`;

    expect(summarizeReadme(readme)).toBe(
      "Generates typed clients from an OpenAPI document."
    );
  });

  it("링크와 강조 표시를 벗겨낸다", () => {
    const readme = `A **fast** parser built on [tree-sitter](https://tree-sitter.github.io).`;

    expect(summarizeReadme(readme)).toBe(
      "A fast parser built on tree-sitter."
    );
  });

  it("목록과 표는 설명으로 쓰지 않는다", () => {
    const readme = `# repo

- 첫 번째 항목이지만 설명은 아닙니다
- 두 번째 항목

| 열 | 값 |
|---|---|

이 저장소는 임베디드 보드용 부트로더를 담고 있습니다.`;

    expect(summarizeReadme(readme)).toBe(
      "이 저장소는 임베디드 보드용 부트로더를 담고 있습니다."
    );
  });

  it("긴 문단은 잘라내고 말줄임표를 붙인다", () => {
    const long = "가".repeat(300);
    const result = summarizeReadme(long);

    expect(result).toHaveLength(201);
    expect(result?.endsWith("…")).toBe(true);
  });

  it("쓸 만한 문단이 없으면 null을 돌려준다", () => {
    expect(summarizeReadme("# 제목만 있음\n\n## 하위 제목")).toBeNull();
    expect(summarizeReadme("")).toBeNull();
  });
});
