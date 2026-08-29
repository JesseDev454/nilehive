import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { NavLink } from "./NavLink";

describe("NavLink active override", () => {
  it("exposes aria-current when the override selects the link", () => {
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <NavLink to="/" activeOverride activeClassName="selected">
          Home
        </NavLink>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });

  it("removes aria-current when the override does not select the route match", () => {
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <NavLink to="/profile" activeOverride={false} activeClassName="selected">
          Profile
        </NavLink>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Profile" })).not.toHaveAttribute("aria-current");
  });
});
