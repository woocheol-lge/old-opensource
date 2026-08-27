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

  it("스킴 없이 붙여넣은 다른 도메인도 받지 않는다", () => {
    // owner 자리(첫 세그먼트)가 도메인처럼 점을 포함하면 github.com이 아닌
    // 사이트로 본다. https://gitlab.com/... 형태를 스킴 없이 붙여넣은 경우다.
    expect(parseGithubFullName("gitlab.com/anza-xyz/newlib")).toBeNull();
  });

  it("owner나 repo가 없는 입력은 거부한다", () => {
    expect(parseGithubFullName("")).toBeNull();
    expect(parseGithubFullName("newlib")).toBeNull();
    expect(parseGithubFullName("https://github.com/anza-xyz")).toBeNull();
  });

  it("레포지토리 이름 자체에 점이 있어도 owner/repo 축약형으로 받는다", () => {
    // jashkenas/underscore.js 실제 사례. owner 자리가 아니라 repo 자리의
    // 점이라서 도메인으로 오판하면 안 된다.
    expect(parseGithubFullName("jashkenas/underscore.js")).toBe(
      "jashkenas/underscore.js"
    );
  });

  it("점이 있는 레포지토리 이름도 전체 URL에서 그대로 뽑는다", () => {
    expect(
      parseGithubFullName("https://github.com/jashkenas/underscore.js")
    ).toBe("jashkenas/underscore.js");
  });
});
