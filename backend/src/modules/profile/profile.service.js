const { db } = require("../../config/db");
const { formatAllowedEmailDomains, isAllowedEmail } = require("../../config/emailPolicy");
const ApiError = require("../../shared/ApiError");
const { validateCompleteProfilePayload, validateSignupReceiptPayload } = require("./profile.validation");

const SIGNUP_RECEIPT_LOOKUP_ATTEMPTS = 5;
const SIGNUP_RECEIPT_LOOKUP_DELAY_MS = 300;
const MAX_SIGNUP_RECEIPT_BYTES = 5 * 1024 * 1024;

function sanitizeFileName(fileName) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

function buildSignupReceiptPath({ clubId, userId, fileName }) {
  const safeName = sanitizeFileName(fileName || "receipt.png") || "receipt.png";
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${clubId}/${userId}/${Date.now()}-${suffix}-${safeName}`;
}

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new ApiError(400, "Receipt upload data is invalid", "VALIDATION_ERROR", {
      field: "file_data_url"
    });
  }

  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

function waitForSignupReceiptRecord() {
  return new Promise((resolve) => {
    setTimeout(resolve, SIGNUP_RECEIPT_LOOKUP_DELAY_MS);
  });
}

function formatProfile(profile, authUser = null) {
  return {
    id: profile.id,
    email: authUser?.email ?? null,
    full_name: profile.full_name,
    role: profile.role,
    club_id: profile.club_id,
    student_id: profile.student_id ?? null,
    requested_role: profile.requested_role ?? null,
    onboarding_status: profile.onboarding_status ?? "complete",
    account_status: profile.account_status ?? "active",
    created_at: profile.created_at,
    updated_at: profile.updated_at
  };
}

async function getMyProfile(options) {
  const { authUser, profile, database = db } = options;

  if (!authUser) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  return {
    user: {
      id: authUser.id,
      email: authUser.email
    },
    profile: profile ? formatProfile(profile, authUser) : null,
    requires_profile_setup: !profile
  };
}

async function completeProfileOnboarding(options) {
  const { authUser, profile: existingProfile, payload, database = db } = options;

  if (!authUser) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (existingProfile) {
    throw new ApiError(409, "Profile already exists for this user", "PROFILE_ALREADY_EXISTS");
  }

  if (!isAllowedEmail(authUser.email)) {
    throw new ApiError(
      403,
      `Please use your Nile University email address (${formatAllowedEmailDomains()}) to complete profile setup.`,
      "UNSUPPORTED_EMAIL_DOMAIN",
      {
        field: "email"
      }
    );
  }

  const validatedPayload = validateCompleteProfilePayload(payload);
  const club = await database.getClubById(validatedPayload.club_id);

  if (!club) {
    throw new ApiError(400, "Selected club does not exist", "INVALID_CLUB", {
      field: "club_id"
    });
  }

  const isAdvisorOnboarding = validatedPayload.requested_role === "advisor";
  const profile = await database.createProfile({
    id: authUser.id,
    full_name: validatedPayload.full_name,
    role: isAdvisorOnboarding ? "advisor" : "student",
    club_id: validatedPayload.club_id,
    student_id: validatedPayload.student_id,
    requested_role: validatedPayload.requested_role,
    onboarding_status: "complete",
    account_status: "active"
  });

  return formatProfile(profile, authUser);
}

async function findSignupMembershipRequest({ database, userId, clubId }) {
  for (let attempt = 0; attempt < SIGNUP_RECEIPT_LOOKUP_ATTEMPTS; attempt += 1) {
    const request = await database.getOpenMembershipRequest(userId, clubId);

    if (request?.due_payment_id) {
      return request;
    }

    if (attempt < SIGNUP_RECEIPT_LOOKUP_ATTEMPTS - 1) {
      await waitForSignupReceiptRecord();
    }
  }

  return null;
}

async function uploadSignupReceipt(options) {
  const { payload, database = db } = options;
  const validatedPayload = validateSignupReceiptPayload(payload);
  const club = await database.getClubById(validatedPayload.club_id);

  if (!club) {
    throw new ApiError(400, "Selected club does not exist", "INVALID_CLUB", {
      field: "club_id"
    });
  }

  const authUser = database.getAuthUserById
    ? await database.getAuthUserById(validatedPayload.user_id)
    : null;

  if (!authUser) {
    throw new ApiError(404, "Signup account was not found", "SIGNUP_USER_NOT_FOUND", {
      field: "user_id"
    });
  }

  const membershipRequest = await findSignupMembershipRequest({
    database,
    userId: validatedPayload.user_id,
    clubId: validatedPayload.club_id
  });

  if (!membershipRequest?.due_payment_id) {
    throw new ApiError(
      409,
      "Your signup payment record is still being prepared. Please finish signup and upload the receipt again after signing in if needed.",
      "SIGNUP_DUES_NOT_READY"
    );
  }

  const { contentType, buffer } = parseDataUrl(validatedPayload.file_data_url);

  if (buffer.length > MAX_SIGNUP_RECEIPT_BYTES) {
    throw new ApiError(400, "Receipt image must be smaller than 5MB", "VALIDATION_ERROR", {
      field: "file_data_url"
    });
  }

  const storagePath = buildSignupReceiptPath({
    clubId: validatedPayload.club_id,
    userId: validatedPayload.user_id,
    fileName: validatedPayload.file_name
  });

  await database.uploadStorageFile({
    bucket: "dues-receipts",
    path: storagePath,
    fileBuffer: buffer,
    contentType
  });

  const payment = await database.updateDuePayment(membershipRequest.due_payment_id, {
    proof_url: storagePath
  });

  return {
    proof_url: payment.proof_url,
    due_payment_id: payment.id,
    user_id: validatedPayload.user_id,
    club_id: validatedPayload.club_id
  };
}

module.exports = {
  completeProfileOnboarding,
  getMyProfile,
  uploadSignupReceipt
};
