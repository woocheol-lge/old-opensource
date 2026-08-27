import { describe, expect, it } from "vitest";
import { warningLevelFor, yearsBetween } from "./staleness";

const NOW = new Date("2026-08-27T00:00:00Z");

function at(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

describe("warningLevelFor", () => {
  it("5년 이상 지나면 빨간 경고를 준다", () => {
    // eblot/newlib 실측값. 2013-07-01, 약 13.2년.
    expect(warningLevelFor(at("2013-07-01"), NOW)).toBe("danger");
    // riscvarchive/riscv-newlib 실측값. 2020-02-04, 약 6.6년.
    expect(warningLevelFor(at("2020-02-04"), NOW)).toBe("danger");
  });

  it("3년 이상 5년 미만이면 노란 경고를 준다", () => {
    expect(warningLevelFor(at("2022-08-27"), NOW)).toBe("caution");
    expect(warningLevelFor(at("2023-08-26"), NOW)).toBe("caution");
  });

  it("3년이 안 되면 경고를 주지 않는다", () => {
    // anza-xyz/newlib 실측값. 2023-10-20, 약 2.9년.
    expect(warningLevelFor(at("2023-10-20"), NOW)).toBe("none");
    // vitasdk/newlib 실측값. 2026-08-10.
    expect(warningLevelFor(at("2026-08-10"), NOW)).toBe("none");
  });

  it("경계값은 등급이 올라가는 쪽에 포함된다", () => {
    const threeYears = new Date(NOW.getTime() - 3 * 365.25 * 86400000);
    const fiveYears = new Date(NOW.getTime() - 5 * 365.25 * 86400000);
    expect(warningLevelFor(threeYears, NOW)).toBe("caution");
    expect(warningLevelFor(fiveYears, NOW)).toBe("danger");
  });

  it("날짜를 확인하지 못하면 등급을 매기지 않는다", () => {
    expect(warningLevelFor(null, NOW)).toBe("none");
  });
});

describe("yearsBetween", () => {
  it("미래 날짜는 0으로 본다", () => {
    expect(yearsBetween(at("2030-01-01"), NOW)).toBe(0);
  });
});
