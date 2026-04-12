const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");

admin.initializeApp();

const resendApiKeySecret = defineSecret("RESEND_API_KEY");

const DEFAULT_REGION = "us-central1";
const DEFAULT_APP_NAME = "ReadLog";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildEmailHtml(resetLink, appName) {
  const safeAppName = escapeHtml(appName);
  const safeResetLink = escapeHtml(resetLink);

  return `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827; line-height: 1.6;">
    <p style="font-size: 13px; color: #6B7280; margin-bottom: 6px;">Password reset request</p>
    <h2 style="margin: 0 0 12px 0;">Reset your ${safeAppName} password</h2>
    <p>We received a request to reset your password.</p>
    <p style="margin: 18px 0 22px;">
      <a href="${safeResetLink}" style="background: #2563EB; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; display: inline-block; font-weight: 600;">Reset password</a>
    </p>
    <p style="margin: 0;">If the button does not work, open this link:</p>
    <p style="margin: 8px 0 0; word-break: break-all;">
      <a href="${safeResetLink}" style="color: #2563EB; text-decoration: underline;">${safeResetLink}</a>
    </p>
    <p style="font-size: 12px; color: #6B7280; margin-top: 22px;">If you did not request this, you can safely ignore this email.</p>
  </div>`;
}

function buildEmailText(resetLink, appName) {
  return [
    `${appName} password reset`,
    "",
    "We received a request to reset your password.",
    "",
    `Open this link to continue: ${resetLink}`,
    "",
    "If you did not request this, you can safely ignore this email.",
  ].join("\n");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeContinueUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

function normalizeEmail(rawEmail) {
  return String(rawEmail || "").trim().toLowerCase();
}

function getEmailConfig() {
  const config = {
    appName: process.env.APP_NAME || DEFAULT_APP_NAME,
    fromEmail: process.env.RESET_EMAIL_FROM,
    replyTo: process.env.RESET_EMAIL_REPLY_TO,
    continueUrl: normalizeContinueUrl(process.env.PASSWORD_RESET_CONTINUE_URL),
    resendApiKey: resendApiKeySecret.value(),
  };

  if (!config.fromEmail) {
    throw new HttpsError("failed-precondition", "RESET_EMAIL_FROM is not configured.");
  }

  if (!config.resendApiKey) {
    throw new HttpsError("failed-precondition", "RESEND_API_KEY is not configured.");
  }

  return config;
}

async function ensureUserExists(email) {
  try {
    await admin.auth().getUserByEmail(email);
    return true;
  } catch (error) {
    const code = String(error?.code || "");
    if (code === "auth/user-not-found") {
      return false;
    }
    throw new HttpsError("internal", "Unable to process reset request.");
  }
}

async function createResetLink(email, continueUrl) {
  const actionCodeSettings = continueUrl
    ? {
        url: continueUrl,
        handleCodeInApp: false,
      }
    : undefined;

  return actionCodeSettings
    ? admin.auth().generatePasswordResetLink(email, actionCodeSettings)
    : admin.auth().generatePasswordResetLink(email);
}

function buildDirectResetLink(generatedResetLink, continueUrl) {
  if (!continueUrl) {
    return generatedResetLink;
  }

  try {
    const sourceUrl = new URL(generatedResetLink);
    const oobCode = sourceUrl.searchParams.get("oobCode");
    if (!oobCode) {
      return generatedResetLink;
    }

    const destinationUrl = new URL(continueUrl);
    destinationUrl.searchParams.set("mode", "resetPassword");
    destinationUrl.searchParams.set("oobCode", oobCode);
    return destinationUrl.toString();
  } catch {
    return generatedResetLink;
  }
}

async function sendResetEmail(email, config) {
  const generatedResetLink = await createResetLink(email, config.continueUrl);
  const resetLink = buildDirectResetLink(generatedResetLink, config.continueUrl);

  await sendWithResend({
    apiKey: config.resendApiKey,
    from: config.fromEmail,
    to: email,
    subject: `${config.appName} password reset instructions`,
    html: buildEmailHtml(resetLink, config.appName),
    text: buildEmailText(resetLink, config.appName),
    replyTo: config.replyTo,
  });
}

async function sendWithResend({ apiKey, from, to, subject, html, text, replyTo }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API failed: ${response.status} ${body}`);
  }
}

exports.sendPasswordResetEmailTransactional = onCall(
  {
    region: process.env.FUNCTIONS_REGION || DEFAULT_REGION,
    secrets: [resendApiKeySecret],
    cors: true,
  },
  async (request) => {
    const email = normalizeEmail(request.data?.email);

    if (!email || !isValidEmail(email)) {
      throw new HttpsError("invalid-argument", "A valid email is required.");
    }

    const config = getEmailConfig();

    const exists = await ensureUserExists(email);
    if (!exists) {
      return { ok: true };
    }

    try {
      await sendResetEmail(email, config);

      return { ok: true };
    } catch (error) {
      logger.error("sendPasswordResetEmailTransactional failed", error);
      throw new HttpsError("internal", "Unable to send reset email.");
    }
  }
);
