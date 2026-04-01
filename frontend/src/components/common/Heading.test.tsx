import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Heading from "./Heading";

describe("Heading", () => {
  it("renders correct heading level based on type", () => {
    render(<Heading as="h1">Header 1</Heading>);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
