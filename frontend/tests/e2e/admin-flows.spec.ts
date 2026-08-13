import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { createE2EState, mockClubServicesApi } from "./helpers/mock-api";

test("admin reviews membership queue and marks a dues proof paid", async ({ page }) => {
  const state = createE2EState();
  state.adminMemberships.push({
    ...state.adminMemberships[0],
    id: "membership-active-1",
    status: "active",
    profile: {
      ...state.adminMemberships[0].profile,
      id: "e2e-active-student",
      full_name: "E2E Active Student"
    }
  });
  await mockClubServicesApi(page, state);
  await loginAs(page, "admin");

  await page.goto("/membership?status=pending", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Membership Review" })).toBeVisible();
  await expect(page.getByText("E2E Student", { exact: true })).toBeVisible();
  await expect(page.getByText("Pending Review", { exact: true })).toBeVisible();
  await expect(page.getByText("E2E Active Student", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Active Member", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Nile Tech Club")).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/dues\/due-tech-1\/proof$/, { waitUntil: "domcontentloaded" }),
    page.getByRole("link", { name: "Review Payment Proof" }).click()
  ]);
  await expect(page.getByRole("heading", { name: "Payment Proof Review" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify Payment" })).toBeEnabled();
  await page.getByRole("button", { name: "Verify Payment" }).click();
  await expect(page.getByText("Paid").first()).toBeVisible();
});

test("admin dashboard shows needs-action queues before metrics and routes to queues", async ({ page }) => {
  const state = createE2EState();
  state.proposals[0] = {
    ...state.proposals[0],
    status: "pending_admin_review",
    current_stage: "admin_review",
    current_owner_role: "admin"
  };
  await mockClubServicesApi(page, state);
  await loginAs(page, "admin");

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("Needs Action Today")).toBeVisible();
  const bodyText = await page.locator("body").innerText();
  expect(bodyText.indexOf("Needs Action Today")).toBeLessThan(bodyText.indexOf("Total Clubs"));
  await expect(page.getByRole("link", { name: /Review Proposals/i })).toHaveAttribute("href", "/proposals?status=pending_admin_review");
  await expect(page.getByRole("link", { name: /Review Payments/i })).toHaveAttribute("href", "/dues?status=submitted");
  await expect(page.getByRole("link", { name: /Review Members/i })).toHaveAttribute("href", "/membership?status=pending");
  await expect(page.getByRole("link", { name: /Review Reports/i })).toHaveAttribute("href", "/archive");
  await expect(page.getByRole("link", { name: /Review Feedback/i })).toHaveAttribute("href", "/feedback?tab=feedback&status=open");

  await Promise.all([
    page.waitForURL(/\/membership\?status=pending$/, { waitUntil: "domcontentloaded" }),
    page.getByRole("link", { name: /Review Members/i }).click()
  ]);
  await expect(page.getByRole("heading", { name: "Membership Review" })).toBeVisible();
});

test("admin opens dues proof from membership review and returns to membership review", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/membership?status=pending", { waitUntil: "domcontentloaded" });

  await page.getByRole("link", { name: "Review Payment Proof" }).click();
  await expect(page).toHaveURL(/\/dues\/due-tech-1\/proof$/);
  await expect(page.getByRole("heading", { name: "Payment Proof Review" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Membership Review" })).toHaveAttribute("href", "/membership");
});

test("admin members URL club filter initializes and can be changed manually", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/members?club_id=club-tech", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Member Database", exact: true })).toBeVisible();
  await expect(page.getByText("Nile Tech Club (NTC)")).toBeVisible();
  await expect(page.getByText("E2E President", { exact: true })).toBeVisible();
  await expect(page.getByText("E2E Business President")).toHaveCount(0);

  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "All clubs" }).click();
  await expect(page.getByText("E2E Business President")).toBeVisible();
});

test("admin cannot reject final proposal without remarks", async ({ page }) => {
  const state = createE2EState();
  state.proposals[0] = {
    ...state.proposals[0],
    status: "pending_admin_review",
    current_stage: "admin_review",
    current_owner_role: "admin"
  };
  await mockClubServicesApi(page, state);
  await loginAs(page, "admin");

  await page.goto("/proposals/proposal-tech-demo", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Build Night Proposal" })).toBeVisible();
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(page.getByText("Add rejection remarks before rejecting this proposal.")).toBeVisible();
});

test("admin apply-to-all-clubs confirmation can be canceled without mutation", async ({ page }) => {
  const state = createE2EState();
  await mockClubServicesApi(page, state);
  await loginAs(page, "admin");

  await page.goto("/dues", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "Apply to all clubs" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Apply payment profile to all clubs?" })).toBeVisible();
  await expect(dialog.getByText("2 clubs")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toHaveCount(0);
  expect(state.paymentProfileApplyRequests).toHaveLength(0);
});

test("admin can create a club and edit club profile media", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/clubs", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Clubs", exact: true })).toBeVisible();
  await expect(page.getByText("Add a new club")).toBeVisible();
  await page.getByLabel("Club Name").fill("Nile Robotics Club");
  await page.getByLabel("Short Code").fill("NRC");
  await page.getByLabel("Description").fill("Students build robotics projects and learn practical automation.");
  await page.getByRole("button", { name: "Tech", exact: true }).click();
  await page.getByRole("button", { name: "Add Club" }).click();

  await expect(page.getByText("Club created")).toBeVisible();
  await expect(page.getByText("Nile Robotics Club")).toBeVisible();

  await page.getByRole("link", { name: /Edit Club/i }).first().click();
  await expect(page).toHaveURL(/\/clubs\/club-tech\/edit$/);
  await expect(page.getByRole("heading", { name: "Edit Club Profile" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Edit Nile Tech Club" })).toBeVisible();
  await page.getByLabel("Description").fill("Updated club profile with workshop details and project goals.");
  await page.locator("input#club_logo").setInputFiles({
    name: "logo.png",
    mimeType: "image/png",
    buffer: Buffer.from("e2e-logo")
  });
  await page.locator("input#club_gallery").setInputFiles({
    name: "gallery.png",
    mimeType: "image/png",
    buffer: Buffer.from("e2e-gallery")
  });
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByText("Club updated")).toBeVisible();
  await expect(page).toHaveURL(/\/clubs$/);
});

test("admin can open a club health dashboard from clubs management", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/clubs", { waitUntil: "domcontentloaded" });

  const healthLink = page.getByRole("link", { name: "View club health" }).first();
  await expect(healthLink).toHaveAttribute("href", "/clubs/club-tech/dashboard");
  await healthLink.click();
  await expect(page).toHaveURL(/\/clubs\/club-tech\/dashboard$/);
  await expect(page.getByText("Club Health", { exact: true })).toBeVisible();
  await expect(page.getByText("Recent Members", { exact: true })).toBeVisible();
});

test("admin opens manage access in a focused page", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/user-management", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  await page.getByRole("link", { name: "Manage Access" }).first().click();

  await expect(page).toHaveURL(/\/user-management\/e2e-student$/);
  await expect(page.getByRole("heading", { name: "Manage User Access", level: 1 })).toBeVisible();
  await expect(page.getByText("E2E Student")).toBeVisible();
  await expect(page.getByRole("button", { name: "Update Role" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to user management/i })).toHaveAttribute("href", "/user-management");
});

test("admin member database columns line up with member fields", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/members", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Member Database", exact: true })).toBeVisible();

  const presidentRow = page.locator("table.clb-table tbody tr").filter({ hasText: "E2E President" }).first();
  await expect(presidentRow.locator("td").nth(0)).toContainText("E2E President");
  await expect(presidentRow.locator("td").nth(1)).toContainText("123456789");
  await expect(presidentRow.locator("td").nth(2)).toContainText("e2e-president@nilehive.test");
  await expect(presidentRow.locator("td").nth(2)).toContainText("08000000000");
  await expect(presidentRow.locator("td").nth(3)).toContainText("Nile Tech Club");
  await expect(presidentRow.locator("td").nth(4)).toContainText("President");
  await expect(presidentRow.locator("td").nth(5)).toContainText("Active");
  await expect(presidentRow.locator("td").nth(6)).toContainText("Not Paid");
});

test("admin can delete a club from the focused club editor", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/clubs/club-business/edit", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Edit Club Profile" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Edit Nile Business Club" })).toBeVisible();
  await page.getByRole("button", { name: "Delete Club" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Delete Nile Business Club?" })).toBeVisible();
  await dialog.getByRole("button", { name: "Delete Club" }).click();

  await expect(page.getByText("Club deleted")).toBeVisible();
  await expect(page).toHaveURL(/\/clubs$/);
  await expect(page.getByText("Nile Business Club")).toHaveCount(0);
});

test("admin can add and clear optional club social links", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/clubs/club-tech/edit", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Edit Nile Tech Club" })).toBeVisible();
  await expect(page.getByText("Leave social links blank to remove them from the public club profile.")).toBeVisible();
  await expect(page.getByLabel("Website")).toHaveCount(0);
  await page.getByLabel("Instagram").fill("https://instagram.com/robotics");
  await page.getByLabel("LinkedIn").fill("https://linkedin.com/company/robotics");
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByText("Club updated")).toBeVisible();
  await expect(page).toHaveURL(/\/clubs$/);

  await page.goto("/clubs/club-tech/edit", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Instagram")).toHaveValue("https://instagram.com/robotics");
  await expect(page.getByLabel("LinkedIn")).toHaveValue("https://linkedin.com/company/robotics");

  await page.getByLabel("Instagram").fill("");
  await page.getByLabel("LinkedIn").fill("");
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByText("Club updated")).toBeVisible();
  await page.goto("/clubs/club-tech/edit", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Instagram")).toHaveValue("");
  await expect(page.getByLabel("LinkedIn")).toHaveValue("");
});
