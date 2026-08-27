import { describe, expect, it } from "vitest";
import { parseGithubFullName } from "./github-url";

describe("parseGithubFullName", () => {
  it("표준 GitHub URL에서 owner/repo를 뽑는다", () => {
    expect(parseGithubFullName("https://github.com/anza-xyz/newlib")).toBe(
      "anza-xyz/newlib"
    );
  });

  it("프로토콜과 뒤 슬래시가 없어도 처리한다", () => {
    expect(parseGithubFullName("github.com/anza-xyz/newlib/")).toBe(
      "anza-xyz/newlib"
    );
  });

  it(".git 접미사를 걷어낸다", () => {
    expect(parseGithubFullName("https://github.com/anza-xyz/newlib.git")).toBe(
      "anza-xyz/newlib"
    );
  });

  it("파일·브랜치 경로가 붙어도 owner/repo만 남긴다", () => {
    expect(
      parseGithubFullName("https://github.com/anza-xyz/newlib/tree/bpf-port")
    ).toBe("anza-xyz/newlib");
  });

  it("owner/repo 표기만 붙여넣어도 받는다", () => {
    expect(parseGithubFullName("anza-xyz/newlib")).toBe("anza-xyz/newlib");
  });

  it("앞뒤 공백을 정리한다", () => {
    expect(parseGithubFullName("  anza-xyz/newlib  ")).toBe("anza-xyz/newlib");
  });

  it("github.com이 아닌 도메인은 받지 않는다", () => {
    expect(parseGithubFullName("https://gitlab.com/anza-xyz/newlib")).toBeNull();
  });

  it("owner나 repo가 없는 입력은 거부한다", () => {
    expect(parseGithubFullName("")).toBeNull();
    expect(parseGithubFullName("newlib")).toBeNull();
    expect(parseGithubFullName("https://github.com/anza-xyz")).toBeNull();
  });
});
