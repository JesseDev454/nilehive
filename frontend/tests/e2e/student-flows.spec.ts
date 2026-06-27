import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("student discovers a club, uploads dues proof, and submits a join request", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/membership");

  await expect(page.getByRole("heading", { name: "Discover Clubs" })).toBeVisible();
  await page.getByPlaceholder(/Search clubs/i).fill("tech");
  await expect(page.getByRole("heading", { name: "Nile Tech Club" }).first()).toBeVisible();

  await page.getByRole("link", { name: "View Club" }).first().click();
  await expect(page.getByRole("heading", { name: /Join Nile Tech Club/i })).toBeVisible();
  await expect(page.getByText("Tech", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Approved events" })).toBeVisible();
  await expect(page.getByText("Build Night", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Website" })).toHaveAttribute("href", "https://clubs.campusone.com.ng/nile-tech");
  await expect(page.getByText("Students presenting projects at Build Night")).toBeVisible();

  await page.getByLabel("Student ID").fill("123456789");
  await page.getByLabel("Phone Number").fill("08000000000");
  await page.getByLabel("Department").fill("Computer Science");
  await page.getByLabel("Name on account used").fill("E2E Student");
  await page.getByLabel("Payment date").fill("2026-06-22");
  await page.getByLabel("Upload dues proof").setInputFiles({
    name: "dues-proof.png",
    mimeType: "image/png",
    buffer: Buffer.from("e2e-dues-proof")
  });

  await expect(page.getByText("Dues proof ready to submit.")).toBeVisible();
  await page.getByRole("button", { name: "Join Club" }).click();

  await expect(page.getByText(/Current request:/i)).toBeVisible();
  await expect(page.getByText("Current request: Payment Under Review.")).toBeVisible();
});

test("student can RSVP for an upcoming event", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/events");

  await expect(page.getByRole("heading", { name: "Events", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Build Night" }).first()).toBeVisible();
  await page.getByRole("button", { name: "RSVP" }).first().click();
  await expect(page.getByRole("button", { name: "RSVP Saved" }).first()).toBeVisible();
});

test("student home omits the standalone discover quick-link and keeps announcements contained", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Hello, E2E/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Discover Clubs" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "View Announcements" })).toBeVisible();
  const announcementCard = page.getByText("Announcements Preview").locator("xpath=ancestor::div[contains(@class, 'rounded')][1]");
  const cardBox = await announcementCard.boundingBox();
  const buttonBox = await page.getByRole("link", { name: "View Announcements" }).boundingBox();

  expect(cardBox).not.toBeNull();
  expect(buttonBox).not.toBeNull();
  expect(buttonBox!.x + buttonBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width + 1);
});

test("student can open the club invite share sheet and copy a link", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          (window as Window & { __copiedClubInvite?: string }).__copiedClubInvite = text;
        }
      },
      configurable: true
    });
  });
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/membership/clubs/club-tech");
  await page.getByRole("button", { name: "Invite Friend" }).click();

  await expect(page.getByTestId("club-share-sheet")).toBeVisible();
  await expect(page.getByRole("button", { name: /Share to apps/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /WhatsApp/i })).toHaveAttribute("href", /https:\/\/wa\.me\/\?text=/);
  await expect(page.getByRole("button", { name: /Snapchat/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Instagram/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Copy Link/i })).toBeVisible();

  await page.getByRole("button", { name: /Copy Link/i }).click();

  await expect(page.getByText("Club link copied")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as Window & { __copiedClubInvite?: string }).__copiedClubInvite))
    .toContain("/membership/clubs/club-tech");
});

test("student gets copy fallbacks for Instagram and Snapchat sharing", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          (window as Window & { __copiedClubInvite?: string }).__copiedClubInvite = text;
        }
      },
      configurable: true
    });
  });
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/membership/clubs/club-tech");
  await page.getByRole("button", { name: "Invite Friend" }).click();
  await page.getByRole("button", { name: /Snapchat/i }).click();
  await expect(page.getByText("Snapchat invite copied")).toBeVisible();

  await page.getByRole("button", { name: "Invite Friend" }).click();
  await page.getByRole("button", { name: /Instagram/i }).click();
  await expect(page.getByText("Instagram invite copied")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as Window & { __copiedClubInvite?: string }).__copiedClubInvite))
    .toContain("Hey, join Nile Tech Club on Campus One.");
});

test("student interest filter narrows discovery cards", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/membership");

  await expect(page.getByRole("heading", { name: "Nile Tech Club" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nile Business Club" }).first()).toBeVisible();
  await expect(page.getByRole("img", { name: "Nile Business Club logo" }).first()).toHaveAttribute("src", "/club-logos/NBUC.png");
  await expect(page.getByText("Dues", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Any dues", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Membership", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Any signup status", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Sort", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Recommended", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Events", { exact: true })).toBeVisible();
  await expect(page.getByText("Any event status", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Faith" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Wellness" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Culture" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Other" })).toHaveCount(0);
  await page.getByRole("button", { name: "Dismiss" }).click();

  await page.getByRole("button", { name: "Tech" }).click();

  await expect(page.getByText(/1 clubs match with 1 active filter/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nile Tech Club" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nile Business Club" })).toHaveCount(0);

  await page.getByRole("button", { name: "All interests" }).click();
  await expect(page.getByRole("heading", { name: "Nile Business Club" }).first()).toBeVisible();
});
