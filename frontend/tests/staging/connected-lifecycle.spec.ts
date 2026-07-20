import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  getStagingBrowserApiBaseUrl,
  hasStagingConfiguration,
  signInThroughStagingBridge,
  type StagingRole
} from "./helpers/campus-one";

type ApiResponse<T> = { status: number; body: T };

async function api<T>(page: Page, path: string, method = "GET", body?: unknown): Promise<ApiResponse<T>> {
  const apiBaseUrl = getStagingBrowserApiBaseUrl();
  return page.evaluate(async ({ apiBaseUrl: baseUrl, path: requestPath, method: requestMethod, body: requestBody }) => {
    const response = await fetch(`${baseUrl}/api/v1${requestPath}`, {
      method: requestMethod,
      credentials: "include",
      headers: requestBody === undefined ? undefined : { "content-type": "application/json" },
      body: requestBody === undefined ? undefined : JSON.stringify(requestBody)
    });
    const text = await response.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { raw: text };
    }
    return { status: response.status, body: parsed };
  }, { apiBaseUrl, path, method, body });
}

async function signedInPage(browser: Browser, role: StagingRole) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signInThroughStagingBridge(page, role);
  return { context, page };
}

function requireData<T>(response: ApiResponse<{ data?: T }>, label: string): T {
  expect(response.status, `${label}: ${JSON.stringify(response.body)}`).toBeGreaterThanOrEqual(200);
  expect(response.status, `${label}: ${JSON.stringify(response.body)}`).toBeLessThan(300);
  expect(response.body.data, `${label} did not return data`).toBeTruthy();
  return response.body.data as T;
}

test.describe("staging connected proposal-to-feedback lifecycle", () => {
  test.skip(
    !hasStagingConfiguration() || process.env.E2E_STAGING_ENABLE_MUTATIONS !== "true",
    "This destructive workflow runs only against the seeded, dedicated staging tenant."
  );

  test("president proposal reaches advisor, admin, event, report, feedback, and club health", async ({ browser }) => {
    const runId = process.env.E2E_STAGING_RUN_ID || `local-${Date.now()}`;
    const label = `E2E lifecycle ${runId}`;
    const eventDate = new Date().toISOString().slice(0, 10);
    const resources: Array<{ context: Awaited<ReturnType<Browser["newContext"]>> }> = [];

    try {
      const president = await signedInPage(browser, "president");
      resources.push(president);
      const clubs = requireData<Array<{ id: string; code?: string }>>(await api(president.page, "/clubs"), "list clubs");
      const club = clubs.find((candidate) => candidate.code === process.env.E2E_STAGING_CLUB_CODE || candidate.code?.startsWith("E2E-"));
      expect(club, "The staging seed did not create the E2E club.").toBeTruthy();

      const proposal = requireData<{ id: string }>(await api(president.page, "/proposals", "POST", {
        club_id: club!.id,
        title: label,
        proposed_activity: label,
        description: "Automated Campus One staging lifecycle coverage.",
        aim_objectives: "Verify the complete Clubly proposal-to-feedback handoff.",
        event_date: eventDate,
        event_time: "12:00",
        location: "E2E Test Hall",
        number_of_participants: 25,
        budget_estimate: 0,
        budget_line_items: [{ item: "Test material", description: "Staging-only verification", quantity: 1, amount: 0 }],
        responsible_members: [{ name: "E2E President", student_id: "900000001", phone_number: "+201000000000", position: "President" }]
      }), "president creates proposal");

      const advisor = await signedInPage(browser, "advisor");
      resources.push(advisor);
      const advisorDecision = await api(advisor.page, `/proposals/${proposal.id}/advisor-decision`, "POST", {
        decision: "approve",
        remarks: "E2E advisor approval"
      });
      requireData(advisorDecision, "advisor approves proposal");

      const admin = await signedInPage(browser, "admin");
      resources.push(admin);
      const adminDecision = await api(admin.page, `/proposals/admin/${proposal.id}/decision`, "POST", {
        decision: "approve",
        remarks: "E2E final approval"
      });
      requireData(adminDecision, "admin approves proposal");

      const student = await signedInPage(browser, "student");
      resources.push(student);
      requireData(await api(student.page, `/events/${proposal.id}/rsvp`, "POST", { status: "going" }), "student RSVPs");
      requireData(await api(student.page, `/events/${proposal.id}/check-in`, "POST"), "student QR checks in");
      requireData(await api(student.page, "/communications/feedback", "POST", {
        club_id: club!.id,
        proposal_id: proposal.id,
        category: "club",
        rating: 5,
        comment: "E2E club feedback after verified attendance"
      }), "student submits club feedback");

      const report = requireData<{ id: string }>(await api(president.page, "/reports", "POST", {
        proposal_id: proposal.id,
        attendance_count: 1,
        summary: "E2E lifecycle event report",
        challenges: "None",
        outcomes: "Complete role handoff verified",
        budget_used: 0,
        media_urls: []
      }), "president submits report");
      expect(report.id).toBeTruthy();

      const engagement = requireData<{ summary?: { rsvp_going_count?: number; attendance_count?: number } }>(
        await api(admin.page, `/events/${proposal.id}/engagement`),
        "admin reads event engagement"
      );
      expect(engagement.summary?.rsvp_going_count).toBeGreaterThanOrEqual(1);
      expect(engagement.summary?.attendance_count).toBeGreaterThanOrEqual(1);

      const health = requireData<Record<string, unknown>>(
        await api(admin.page, `/dashboard/admin-operations/clubs/${club!.id}`),
        "admin reads club health"
      );
      expect(health).toBeTruthy();
    } finally {
      await Promise.all(resources.map(({ context }) => context.close()));
    }
  });
});
