import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, afterEach } from "vitest";
import TagList from "@/components/ui/TagList";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TagList", () => {
  it("rendert nichts bei leerem Tags-Array", () => {
    const { container } = render(<TagList tags={[]} />);

    expect(container.firstElementChild).toBeNull();
  });

  it("rendert eine Liste mit aria-label", () => {
    render(<TagList tags={["Politik"]} />);

    expect(
      screen.getByRole("list", { name: "Schlagwörter" }),
    ).toBeInTheDocument();
  });

  it("rendert alle Tags als Listenelemente", () => {
    render(<TagList tags={["Politik", "Berlin", "Kultur"]} />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Politik");
    expect(items[1]).toHaveTextContent("Berlin");
    expect(items[2]).toHaveTextContent("Kultur");
  });

  it("rendert einzelnen Tag korrekt", () => {
    render(<TagList tags={["Meinung"]} />);

    expect(screen.getByRole("listitem")).toHaveTextContent("Meinung");
  });

  it("akzeptiert zusaetzliche className", () => {
    render(<TagList tags={["Test"]} className="mt-4" />);

    const list = screen.getByRole("list");
    expect(list.className).toContain("mt-4");
  });

  it("behaelt Standard-Flex-Klassen bei", () => {
    render(<TagList tags={["Test"]} />);

    const list = screen.getByRole("list");
    expect(list.className).toContain("flex");
    expect(list.className).toContain("flex-wrap");
    expect(list.className).toContain("gap-2");
  });
});
