import { describe, expect, it } from "vitest";
import { resolveStorageFileUrl } from "./storage";

describe("resolveStorageFileUrl", () => {
  it("keeps root-relative public asset paths unchanged", async () => {
    await expect(resolveStorageFileUrl("club-media", "/demo-club-gallery/nile-book-club/reading-circle.png"))
      .resolves
      .toBe("/demo-club-gallery/nile-book-club/reading-circle.png");
  });

  it("keeps absolute URLs unchanged", async () => {
    await expect(resolveStorageFileUrl("club-media", "https://example.com/gallery.png"))
      .resolves
      .toBe("https://example.com/gallery.png");
  });
});
