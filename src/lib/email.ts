import { Order } from "@/types/database";
import { Book } from "@/types/book";

export interface SendOrderConfirmationParams {
  order: Order;
  book: Book;
  downloadUrl: string;
  customerEmail: string;
  customerName?: string | null;
}

export interface SendOrderRecoveryParams {
  customerEmail: string;
  orders: Array<{
    order: Order;
    book: Book | null;
    downloadUrl: string;
  }>;
}

export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationParams
): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
  const { order, book, downloadUrl, customerEmail, customerName } = params;
  const greeting = customerName ? `Dear ${customerName},` : "Dear Reader,";

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "Meridian Press <orders@meridianpress.pub>";

  const subject = `Your Monograph Access: "${book.title}" [Order ${order.id}]`;

  const textContent = `${greeting}

Thank you for acquiring "${book.title}" (${book.subtitle}) published by Meridian Press.

ORDER SUMMARY:
- Order Reference: ${order.id}
- Monograph: ${book.title}
- Author: ${book.author.name}
- Total Paid: ₹${order.amount.toFixed(2)}
- License: Perpetual DRM-Free Personal License

SECURE DIGITAL DOWNLOADS:
Your multi-format DRM-free download bundle (EPUB, PDF, MOBI) is available immediately at:
${downloadUrl}

RECOVERY:
If you ever misplace your files, you can access your order library anytime using your email at:
${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/recover

With warm regards,
The Editorial Board
Meridian Press
https://meridianpress.pub
`;

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif; line-height: 1.6; color: #14161a; background-color: #faf8f5; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e2d8; border-radius: 4px; padding: 32px; }
    .header { border-bottom: 2px solid #b85d19; padding-bottom: 16px; margin-bottom: 24px; }
    .logo { font-size: 20px; font-weight: bold; font-family: Georgia, serif; color: #14161a; }
    .subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #737680; font-family: monospace; }
    .order-box { background: #f4efe6; border: 1px solid #ddd6c9; border-radius: 4px; padding: 18px; margin: 20px 0; }
    .btn { display: inline-block; background: #14161a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 3px; font-size: 14px; font-weight: 500; margin: 16px 0; }
    .colophon { font-size: 11px; color: #737680; border-top: 1px solid #e7e2d8; padding-top: 16px; margin-top: 32px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Meridian Press</div>
      <div class="subtitle">Official Digital Monograph Delivery</div>
    </div>

    <p>${greeting}</p>
    <p>Thank you for supporting independent authorship. Your acquisition of <strong>"${book.title}"</strong> has been confirmed.</p>

    <div class="order-box">
      <strong>Order Reference:</strong> ${order.id}<br/>
      <strong>Monograph:</strong> ${book.title}<br/>
      <strong>Author:</strong> ${book.author.name}<br/>
      <strong>Amount Paid:</strong> ₹${order.amount.toFixed(2)}<br/>
      <strong>License:</strong> Perpetual DRM-Free Personal License
    </div>

    <p>Your complete monograph package is ready for download in reflowable EPUB, vector-grade PDF, and Kindle MOBI formats:</p>

    <p style="text-align: center;">
      <a href="${downloadUrl}" class="btn">Access &amp; Download Monograph</a>
    </p>

    <p style="font-size: 13px; color: #5c5f68;">If the button above does not work, copy and paste this link into your browser:<br/><a href="${downloadUrl}" style="color: #b85d19;">${downloadUrl}</a></p>

    <div class="colophon">
      Published by Meridian Press · Set in Newsreader and Geist.<br/>
      Need assistance? Contact <a href="mailto:orders@meridianpress.pub" style="color: #b85d19;">orders@meridianpress.pub</a>
    </div>
  </div>
</body>
</html>`;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: customerEmail,
          subject,
          text: textContent,
          html: htmlContent,
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        return { success: true, messageId: resData.id };
      }
      console.warn("[Email Service] Resend dispatch failed:", resData);
    } catch (err) {
      console.error("[Email Service] Error sending email via Resend:", err);
    }
  }

  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] To: ${customerEmail} | Subject: ${subject}`);
  console.log(`Download Link: ${downloadUrl}`);
  console.log(`======================================================\n`);

  return { success: true, simulated: true };
}

export async function sendOrderRecoveryEmail(
  params: SendOrderRecoveryParams
): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
  const { customerEmail, orders } = params;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "Meridian Press <orders@meridianpress.pub>";

  const subject = `Your Meridian Press Monograph Library Access Links`;

  const orderItemsText = orders
    .map(
      (item) =>
        `- "${item.book?.title || item.order.bookTitle}" (Order ${item.order.id}):\n  ${item.downloadUrl}`
    )
    .join("\n\n");

  const textContent = `Dear Reader,

Here are the secure access links for your purchased monographs from Meridian Press:

${orderItemsText}

All monographs include EPUB, PDF, and MOBI DRM-free files with perpetual reading rights.

With warm regards,
Meridian Press
`;

  const orderItemsHtml = orders
    .map(
      (item) =>
        `<div style="background: #f4efe6; border: 1px solid #ddd6c9; border-radius: 4px; padding: 16px; margin-bottom: 12px;">
          <strong>${item.book?.title || item.order.bookTitle}</strong><br/>
          <span style="font-size: 12px; color: #5c5f68; font-family: monospace;">Order Reference: ${item.order.id} · Paid ₹${item.order.amount}</span><br/><br/>
          <a href="${item.downloadUrl}" style="display: inline-block; background: #14161a; color: #ffffff !important; text-decoration: none; padding: 8px 16px; border-radius: 3px; font-size: 13px;">Access Downloads</a>
        </div>`
    )
    .join("");

  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Georgia, serif; line-height: 1.6; color: #14161a; background-color: #faf8f5; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e2d8; border-radius: 4px; padding: 32px;">
    <div style="border-bottom: 2px solid #b85d19; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="font-size: 20px; font-weight: bold; font-family: Georgia, serif; color: #14161a;">Meridian Press</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #737680; font-family: monospace;">Monograph Library Recovery</div>
    </div>
    <p>Dear Reader,</p>
    <p>We received a request to retrieve your purchased monographs. Below are your direct access links:</p>
    ${orderItemsHtml}
    <div style="font-size: 11px; color: #737680; border-top: 1px solid #e7e2d8; padding-top: 16px; margin-top: 32px; font-family: monospace;">
      Meridian Press · Need assistance? <a href="mailto:orders@meridianpress.pub" style="color: #b85d19;">orders@meridianpress.pub</a>
    </div>
  </div>
</body>
</html>`;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: customerEmail,
          subject,
          text: textContent,
          html: htmlContent,
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        return { success: true, messageId: resData.id };
      }
    } catch (err) {
      console.error("[Email Service] Error sending recovery email:", err);
    }
  }

  console.log(`\n======================================================`);
  console.log(`[RECOVERY EMAIL] To: ${customerEmail} | Orders: ${orders.length}`);
  console.log(`======================================================\n`);

  return { success: true, simulated: true };
}
