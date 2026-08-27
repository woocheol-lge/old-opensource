import { describe, expect, it } from "vitest";
import { buildQuery, chooseBasis, extractKeywords } from "./alternatives";

describe("chooseBasis", () => {
  it("별이 가장 많은 후보의 토픽을 근거로 삼는다", () => {
    const basis = chooseBasis(
      [
        { topics: [], description: "포크", stars: 10 },
        {
          topics: ["cache", "database", "distributed-systems", "in-memory-database"],
          description: "원조",
          stars: 76116,
        },
      ],
      "redis"
    );

    // 하이픈으로 나눈 단어가 가장 많은 토픽이 가장 구체적이다.
    expect(basis).toEqual({ kind: "topic", topic: "in-memory-database" });
  });

  it("레포지토리 이름과 같은 토픽은 근거로 쓰지 않는다", () => {
    const basis = chooseBasis(
      [
        {
          topics: ["tinyusb", "usb", "usb-cdc", "embedded"],
          description: "USB stack",
          stars: 7056,
        },
      ],
      "tinyusb"
    );

    expect(basis).toEqual({ kind: "topic", topic: "usb-cdc" });
  });

  it("토픽이 없으면 설명의 핵심어로 넘어간다", () => {
    const basis = chooseBasis(
      [
        {
          topics: [],
          description: "Newlib is a C library intended for use on embedded systems",
          stars: 75,
        },
      ],
      "newlib"
    );

    expect(basis).toEqual({
      kind: "keyword",
      keywords: ["library", "embedded", "systems"],
    });
  });

  it("토픽도 설명도 없으면 근거를 만들지 않는다", () => {
    expect(chooseBasis([{ topics: [], description: null, stars: 0 }], "x")).toBeNull();
    expect(chooseBasis([], "x")).toBeNull();
  });
});

describe("extractKeywords", () => {
  it("흔한 말과 레포지토리 이름을 걷어낸다", () => {
    expect(
      extractKeywords("Redis is a fast in-memory store for the web", "redis")
    ).toEqual(["fast", "memory", "store"]);
  });

  it("두 글자 이하는 걷어내되 c++ 같은 언어 이름은 남긴다", () => {
    // A와 DB는 짧아서 빠지고, for는 흔한 말이라 빠진다.
    expect(extractKeywords("A C++ ORM for DB", "x")).toEqual(["c++", "orm"]);
  });
});

describe("buildQuery", () => {
  it("토픽 근거는 topic 한정자로 바꾼다", () => {
    expect(buildQuery({ kind: "topic", topic: "usb-cdc" })).toBe("topic:usb-cdc");
  });

  it("핵심어 근거는 낱말을 이어 붙인다", () => {
    expect(
      buildQuery({ kind: "keyword", keywords: ["library", "embedded", "systems"] })
    ).toBe("library embedded systems");
  });
});

describe("chooseBasis: 미러와 포팅이 섞인 목록", () => {
  // newlib 검색 결과의 실제 설명들. 별이 가장 많은 것이 미러다.
  const newlibCandidates = [
    { topics: [], description: "Cygwin newlib mirror", stars: 172 },
    { topics: [], description: "RISC-V port of newlib", stars: 105 },
    {
      topics: [],
      description: "Newlib is a C library intended for use on embedded systems",
      stars: 39,
    },
  ];

  it("별이 적어도 프로젝트를 정의하는 설명을 근거로 삼는다", () => {
    expect(chooseBasis(newlibCandidates, "newlib")).toEqual({
      kind: "keyword",
      keywords: ["library", "embedded", "systems"],
    });
  });

  it("정의문이 하나도 없으면 별이 가장 많은 후보로 물러선다", () => {
    expect(chooseBasis(newlibCandidates.slice(0, 2), "newlib")).toEqual({
      kind: "keyword",
      keywords: ["cygwin", "mirror"],
    });
  });
});

describe("chooseBasis: 형태를 가리키는 일반 토픽을 피한다", () => {
  it("usb-devices처럼 형태를 가리키는 토픽 대신 기술 용어로 끝나는 토픽을 고른다", () => {
    // hathach/tinyusb 실제 토픽. usb-devices(298개)가 usb-cdc(126개)보다
    // 글자 수는 길지만 실제로는 더 넓은 토픽이었다. 이 규칙이 usb-cdc까지
    // 정확히 짚어내진 못하지만, usb-devices를 걸러내고 usb-host를 골라
    // 실제로 CherryUSB 같은 대안을 찾아준다는 것은 실행으로 확인했다.
    const basis = chooseBasis(
      [
        {
          topics: [
            "embedded", "midi", "msc", "usb",
            "usb-cdc", "usb-devices", "usb-drive", "usb-hid", "usb-host", "webusb",
          ],
          description: "USB stack",
          stars: 7056,
        },
      ],
      "tinyusb"
    );

    expect(basis?.kind).toBe("topic");
    if (basis?.kind === "topic") {
      expect(basis.topic).not.toBe("usb-devices");
      expect(basis.topic).not.toBe("usb-drive");
    }
  });

  it("기술 용어로 끝나는 토픽이 하나도 없으면 그래도 하나는 고른다", () => {
    const basis = chooseBasis(
      [{ topics: ["usb-devices", "usb-tools"], description: null, stars: 1 }],
      "x"
    );

    expect(basis?.kind).toBe("topic");
  });
});
