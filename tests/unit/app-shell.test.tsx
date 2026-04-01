import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

it("renders the TeXquill workspace shell", () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { name: /texquill/i })).toBeInTheDocument();
  expect(screen.getByText(/paper-ready tables/i)).toBeInTheDocument();
});
