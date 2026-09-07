const OFFICIAL_EMAIL_DOMAIN = "nileuniversity.edu.ng";
const TEST_EMAIL_DOMAIN = "nilehive.test";

function normalizeDomain(domain) {
  return domain.trim().replace(/^@/, "").toLowerCase();
}

function parseDomains(value) {
  return value
    .split(",")
    .map(normalizeDomain)
    .filter(Boolean);
}

function getAllowedEmailDomains() {
  if (process.env.ALLOWED_EMAIL_DOMAINS) {
    return parseDomains(process.env.ALLOWED_EMAIL_DOMAINS);
  }

  if (process.env.NODE_ENV === "production") {
    return [OFFICIAL_EMAIL_DOMAIN];
  }

  return [OFFICIAL_EMAIL_DOMAIN, TEST_EMAIL_DOMAIN];
}

function getEmailDomain(email) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const atIndex = normalizedEmail.lastIndexOf("@");

  return atIndex === -1 ? "" : normalizedEmail.slice(atIndex + 1);
}

function isAllowedEmail(email) {
  const domain = getEmailDomain(email);

  return Boolean(domain) && getAllowedEmailDomains().includes(domain);
}

function formatAllowedEmailDomains() {
  return getAllowedEmailDomains()
    .map((domain) => `@${domain}`)
    .join(", ");
}

module.exports = {
  OFFICIAL_EMAIL_DOMAIN,
  TEST_EMAIL_DOMAIN,
  formatAllowedEmailDomains,
  getAllowedEmailDomains,
  getEmailDomain,
  isAllowedEmail
};
