const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

admin.initializeApp();

const resendApiKeySecret = defineSecret("RESEND_API_KEY");

const DEFAULT_REGION = "us-central1";
const DEFAULT_APP_NAME = "ReadLog";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildEmailHtml(resetLink, appName) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
    <h2 style="margin-bottom: 8px;">Reset your ${appName} password</h2>
    <p style="line-height: 1.6;">We received a request to reset your password. Click the button below to continue.</p>
    <p style="margin: 24px 0;">
      <a href="${resetLink}" style="background: #2563EB; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; display: inline-block; font-weight: 600;">Reset Password</a>
    </p>
    <p style="line-height: 1.6;">If you did not request this, you can safely ignore this email.</p>
    <p style="font-size: 12px; color: #6B7280; margin-top: 24px;">If the button does not work, copy and paste this link into your browser:</p>
    <p style="font-size: 12px; word-break: break-all; color: #374151;">${resetLink}</p>
  </div>`;
}

function normalizeEmail(rawEmail) {
  return String(rawEmail || "").trim().toLowerCase();
}

function getEmailConfig() {
  const config = {
    appName: process.env.APP_NAME || DEFAULT_APP_NAME,
    fromEmail: process.env.RESET_EMAIL_FROM,
    replyTo: process.env.RESET_EMAIL_REPLY_TO,
    continueUrl: process.env.PASSWORD_RESET_CONTINUE_URL,
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

async function sendResetEmail(email, config) {
  const resetLink = await createResetLink(email, config.continueUrl);

  await sendWithResend({
    apiKey: config.resendApiKey,
    from: config.fromEmail,
    to: email,
    subject: `Reset your ${config.appName} password`,
    html: buildEmailHtml(resetLink, config.appName),
    replyTo: config.replyTo,
  });
}

async function sendWithResend({ apiKey, from, to, subject, html, replyTo }) {
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
      console.error("sendPasswordResetEmailTransactional failed", error);
      throw new HttpsError("internal", "Unable to send reset email.");
    }
  }
);
