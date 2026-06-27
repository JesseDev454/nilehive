import { describe, expect, it } from "vitest";
import { getClubInterestCategories, getStudentInterestCategories } from "./clubDiscovery";

describe("club discovery helpers", () => {
  it("infers club interest categories from name and description", () => {
    const categories = getClubInterestCategories({
      name: "Nile Google Developers",
      code: "GDSC",
      description: "A community for coding, software projects, and technology learning.",
      categories: []
    });

    expect(categories).toContain("Tech");
  });

  it("uses the maintained club-code category mapping before keyword inference", () => {
    const categories = getClubInterestCategories({
      name: "Nile Climate Initiatives Club",
      code: "NCIC",
      description: "Environmental awareness and sustainability projects.",
      categories: []
    });

    expect(categories).toEqual(["Tech", "Volunteering", "Arts"]);
  });

  it("ignores removed persisted categories", () => {
    const categories = getClubInterestCategories({
      name: "Nile Society",
      code: null,
      description: "A place to meet people and share ideas.",
      categories: ["Faith", "Wellness", "Culture", "Other"]
    });

    expect(categories).toEqual([]);
  });

  it("returns no categories when no valid category keywords match", () => {
    const categories = getClubInterestCategories({
      name: "Nile Society",
      code: null,
      description: "A place to meet people and share ideas.",
      categories: []
    });

    expect(categories).toEqual([]);
  });

  it("recommends technical and academic interests from student department", () => {
    const categories = getStudentInterestCategories({
      department: "Computer Science",
      join_reason: null
    });

    expect(categories).toEqual(expect.arrayContaining(["Tech", "Academics"]));
  });
});
