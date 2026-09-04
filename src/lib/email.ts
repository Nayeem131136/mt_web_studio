import emailjs from "@emailjs/browser";
import { Lead } from "@/types";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const isConfigured = !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

/**
 * Sends an automatic confirmation email to the client right after they submit
 * their project request. Uses EmailJS (free tier: 200 emails/month, no backend
 * or billing card needed) — see .env.example for the 3 keys required.
 *
 * If EmailJS isn't configured yet, this quietly no-ops instead of breaking the
 * submission flow — the client still sees the on-screen success + reference ID.
 */
export async function sendConfirmationEmail(lead: {
  referenceId: string;
  businessName: string;
  ownerName: string;
  email: string;
  package: string;
}) {
  if (!isConfigured) {
    console.warn(
      "[email] EmailJS is not configured — skipping confirmation email. " +
      "Set VITE_EMAILJS_SERVICE_ID / TEMPLATE_ID / PUBLIC_KEY in .env.local to enable it."
    );
    return;
  }

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: lead.email,
        to_name: lead.ownerName,
        business_name: lead.businessName,
        reference_id: lead.referenceId,
        package_name: lead.package,
        track_url: `${window.location.origin}/track`,
      },
      { publicKey: PUBLIC_KEY }
    );
  } catch (err) {
    // Never block the submission flow on email failure — just log it.
    console.error("[email] Failed to send confirmation email:", err);
  }
}
