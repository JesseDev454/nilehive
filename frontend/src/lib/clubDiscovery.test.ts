import { describe, expect, it } from "vitest";
import { getClubInterestCategories, getStudentInterestCategories } from "./clubDiscovery";

describe("club discovery helpers", () => {
  it("infers club interest categories from name and description", () => {
    const categories = getClubInterestCategories({
      name: "Nile Google Developers",
      code: "GDSC",
      description: "A community for coding, software projects, and technology learning."
    });

    expect(categories).toContain("Tech");
  });

  it("falls back to Other when no category keywords match", () => {
    const categories = getClubInterestCategories({
      name: "Nile Society",
      code: null,
      description: "A place to meet people and share ideas."
    });

    expect(categories).toEqual(["Other"]);
  });

  it("recommends technical and academic interests from student department", () => {
    const categories = getStudentInterestCategories({
      department: "Computer Science",
      join_reason: null
    });

    expect(categories).toEqual(expect.arrayContaining(["Tech", "Academics"]));
  });
});
