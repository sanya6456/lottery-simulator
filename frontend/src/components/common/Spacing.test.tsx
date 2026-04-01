import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Spacing from "./Spacing";

describe("Spacing", () => {
  it("renders without crashing", () => {
    const { container } = render(<Spacing size="md" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
