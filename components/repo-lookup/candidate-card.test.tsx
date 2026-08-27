import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RepositoryCandidate } from "@/lib/repo-lookup";
import { CandidateCard } from "./candidate-card";

const base: RepositoryCandidate = {
  fullName: "eblot/newlib",
  owner: "eblot",
  name: "newlib",
  url: "https://github.com/eblot/newlib",
  description: "Sourceware.org's Newlib mirror",
  license: "GPL-2.0",
  createdAt: "2013-07-02T00:00:00Z",
  lastUpdate: "2013-07-01T00:00:00Z",
  warningLevel: "danger",
};

function renderCard(overrides: Partial<RepositoryCandidate> = {}) {
  return render(<CandidateCard candidate={{ ...base, ...overrides }} />);
}

describe("CandidateCard", () => {
  it("생성일과 마지막 업데이트를 날짜로 보여준다", () => {
    renderCard();

    expect(screen.getByText("생성일").nextElementSibling).toHaveTextContent(
      "2013-07-02"
    );
    expect(
      screen.getByText("마지막 업데이트").nextElementSibling
    ).toHaveTextContent("2013-07-01");
  });

  it("owner와 이름을 GitHub 원본으로 연결한다", () => {
    renderCard();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://github.com/eblot/newlib");
    expect(link).toHaveTextContent("eblot/newlib");
  });

  it("라이선스 정보가 없으면 없다는 사실을 드러낸다", () => {
    renderCard({ license: null });

    expect(screen.getByText("라이선스 표기 없음")).toBeInTheDocument();
  });

  it("마지막 커밋을 가져오지 못하면 확인 불가로 표시하고 경고를 붙이지 않는다", () => {
    const { container } = renderCard({
      lastUpdate: null,
      warningLevel: "none",
    });

    expect(
      screen.getByText("마지막 업데이트").nextElementSibling
    ).toHaveTextContent("확인 불가");
    expect(container.querySelector("[data-warning]")).toBeNull();
  });

  it("경고 등급에 따라 뱃지를 붙인다", () => {
    const { container: danger } = renderCard({ warningLevel: "danger" });
    expect(danger.querySelector("[data-warning='danger']")).toBeInTheDocument();

    const { container: caution } = renderCard({ warningLevel: "caution" });
    expect(
      caution.querySelector("[data-warning='caution']")
    ).toBeInTheDocument();

    const { container: none } = renderCard({ warningLevel: "none" });
    expect(none.querySelector("[data-warning]")).toBeNull();
  });
});
