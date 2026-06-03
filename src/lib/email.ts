import nodemailer from "nodemailer";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Email service configuration using ArchCool store credentials
export const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "mail.privateemail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
  tls: {
    rejectUnauthorized: true,
  },
});

// Email templates for different purposes
export const emailTemplates = {
  // OTP Templates
  otpSignIn: (otp: string) => ({
    subject: "🔐 Your ArchCool Sign-In Code",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ArchCool</h1>
          <p style="color: #6b7280; margin: 5px 0;">Your Premium Store</p>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Sign-In Verification Code</h2>
          <p style="color: #6b7280; margin-bottom: 30px;">Enter this code to sign in to your ArchCool account:</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">${otp}</span>
          </div>

          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            This code expires in 5 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2025 ArchCool Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Your ArchCool sign-in code is: ${otp}. This code expires in 5 minutes.`,
  }),

  otpPasswordReset: (otp: string) => ({
    subject: "🔒 Reset Your ArchCool Password",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ArchCool</h1>
          <p style="color: #6b7280; margin: 5px 0;">Password Reset Request</p>
        </div>

        <div style="background: #fef2f2; padding: 30px; border-radius: 12px; text-align: center; border: 1px solid #fecaca;">
          <h2 style="color: #dc2626; margin-bottom: 20px;">🔒 Password Reset Code</h2>
          <p style="color: #374151; margin-bottom: 30px;">Enter this code to reset your password:</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 4px;">${otp}</span>
          </div>

          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            This code expires in 10 minutes. If you didn't request this, please contact support immediately.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2025 ArchCool Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Your ArchCool password reset code is: ${otp}. This code expires in 10 minutes.`,
  }),

  otpEmailVerification: (otp: string) => ({
    subject: "✅ Verify Your ArchCool Email",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ArchCool</h1>
          <p style="color: #6b7280; margin: 5px 0;">Email Verification</p>
        </div>

        <div style="background: #f0fdf4; padding: 30px; border-radius: 12px; text-align: center; border: 1px solid #bbf7d0;">
          <h2 style="color: #16a34a; margin-bottom: 20px;">✅ Verify Your Email</h2>
          <p style="color: #374151; margin-bottom: 30px;">Enter this code to verify your email address:</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 4px;">${otp}</span>
          </div>

          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            This code expires in 15 minutes.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2025 ArchCool Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Your ArchCool email verification code is: ${otp}. This code expires in 15 minutes.`,
  }),

  // Magic Link Template
  magicLink: (url: string) => ({
    subject: "🔗 Your ArchCool Magic Sign-In Link",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ArchCool</h1>
          <p style="color: #6b7280; margin: 5px 0;">Magic Link Sign-In</p>
        </div>

        <div style="background: #eff6ff; padding: 30px; border-radius: 12px; text-align: center; border: 1px solid #bfdbfe;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">🔗 Sign in to ArchCool</h2>
          <p style="color: #374151; margin-bottom: 30px;">Click the button below to sign in to your account:</p>

          <a href="${url}"
             style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px;
                    text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            Sign In to ArchCool
          </a>

          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            This link expires in 10 minutes. If you didn't request this, please ignore this email.
          </p>

          <div style="margin-top: 30px; padding: 15px; background: #f9fafb; border-radius: 6px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              If the button doesn't work, copy and paste this link: <br>
              <span style="word-break: break-all;">${url}</span>
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2025 ArchCool Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Sign in to ArchCool: ${url}`,
  }),

  // Order Status Templates
  orderConfirmed: (orderData: {
    referenceId: string;
    customerName: string;
    amount: number;
    items: any[];
    magicLink?: string;
  }) => ({
    subject: `🎉 Order Confirmed - #${orderData.referenceId}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ArchCool</h1>
          <p style="color: #6b7280; margin: 5px 0;">Order Confirmation</p>
        </div>

        <div style="background: #f0fdf4; padding: 30px; border-radius: 12px; border: 1px solid #bbf7d0;">
          <h2 style="color: #16a34a; margin-bottom: 20px;">🎉 Thank you for your order!</h2>
          <p style="color: #374151; margin-bottom: 20px;">Hi ${escapeHtml(orderData.customerName)},</p>
          <p style="color: #374151; margin-bottom: 30px;">
            Your order has been confirmed and will be processed soon.
          </p>
          <p style="color: #b45309; font-size: 14px; margin-top: 16px;"><strong>Note:</strong> All product prices include VAT. Shipping is not included and will be paid separately on delivery. Shipping costs vary by location.</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Order Details</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> #${orderData.referenceId}</p>
            <p style="margin: 5px 0;"><strong>Total:</strong> £${orderData.amount}</p>
            <p style="margin: 5px 0;"><strong>Items:</strong> ${orderData.items.length} item(s)</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${orderData.magicLink || `${process.env.NEXT_PUBLIC_APP_URL}/my-orders/${orderData.referenceId}`}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Track Your Order
            </a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2025 ArchCool Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Thank you for your order #${orderData.referenceId}! Total: £${orderData.amount}. Track at: ${orderData.magicLink || `${process.env.NEXT_PUBLIC_APP_URL}/my-orders/${orderData.referenceId}`}`,
  }),

  orderShipped: (orderData: {
    referenceId: string;
    customerName: string;
    trackingNumber?: string;
  }) => ({
    subject: `📦 Order Shipped - #${orderData.referenceId}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ArchCool</h1>
          <p style="color: #6b7280; margin: 5px 0;">Shipping Update</p>
        </div>

        <div style="background: #fef3c7; padding: 30px; border-radius: 12px; border: 1px solid #fcd34d;">
          <h2 style="color: #d97706; margin-bottom: 20px;">📦 Your order is on the way!</h2>
          <p style="color: #374151; margin-bottom: 20px;">Hi ${escapeHtml(orderData.customerName)},</p>
          <p style="color: #374151; margin-bottom: 30px;">
            Great news! Your order #${orderData.referenceId} has been shipped and is on its way to you.
          </p>
          <p style="color: #b45309; font-size: 14px; margin-top: 16px;"><strong>Note:</strong> All product prices include VAT. Shipping is not included and will be paid separately on delivery. Shipping costs vary by location.</p>

          ${
            orderData.trackingNumber
              ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Tracking Information</h3>
            <p style="font-size: 18px; font-weight: bold; color: #d97706; letter-spacing: 1px;">
              ${orderData.trackingNumber}
            </p>
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-orders/${orderData.referenceId}"
               style="display: inline-block; background: #d97706; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
              Track Package
            </a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2025 ArchCool Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Your order #${orderData.referenceId} has been shipped! ${orderData.trackingNumber ? `Tracking: ${orderData.trackingNumber}` : ""} Track at: ${process.env.NEXT_PUBLIC_APP_URL}/my-orders/${orderData.referenceId}`,
  }),

  paymentConfirmed: (orderData: {
    referenceId: string;
    customerName: string;
    amount: number;
    magicLink?: string;
  }) => ({
    subject: `💳 Payment Confirmed - #${orderData.referenceId}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ArchCool</h1>
          <p style="color: #6b7280; margin: 5px 0;">Payment Confirmation</p>
        </div>

        <div style="background: #f0fdf4; padding: 30px; border-radius: 12px; border: 1px solid #bbf7d0;">
          <h2 style="color: #16a34a; margin-bottom: 20px;">💳 Payment Confirmed!</h2>
          <p style="color: #374151; margin-bottom: 20px;">Hi ${escapeHtml(orderData.customerName)},</p>
          <p style="color: #374151; margin-bottom: 30px;">
            We've successfully received your payment for order #${orderData.referenceId}.
          </p>
          <p style="color: #b45309; font-size: 14px; margin-top: 16px;"><strong>Note:</strong> All product prices include VAT. Shipping is not included and will be paid separately on delivery. Shipping costs vary by location.</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Payment Details</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> #${orderData.referenceId}</p>
            <p style="margin: 5px 0;"><strong>Amount Paid:</strong> £${orderData.amount}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #16a34a;">✅ Confirmed</span></p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${orderData.magicLink || `${process.env.NEXT_PUBLIC_APP_URL}/my-orders/${orderData.referenceId}`}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Track Your Order
            </a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2025 ArchCool Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Payment confirmed for order #${orderData.referenceId}! Amount: £${orderData.amount}. Track at: ${orderData.magicLink || `${process.env.NEXT_PUBLIC_APP_URL}/my-orders/${orderData.referenceId}`}`,
  }),

  // Refund Confirmation Template
  refundConfirmation: (orderData: {
    referenceId: string;
    customerName?: string;
    amount: number;
    reason?: string;
  }) => ({
    subject: `💸 Refund Processed - #${orderData.referenceId}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ArchCool</h1>
          <p style="color: #6b7280; margin: 5px 0;">Refund Confirmation</p>
        </div>
        <div style="background: #f0fdf4; padding: 30px; border-radius: 12px; border: 1px solid #bbf7d0;">
          <h2 style="color: #16a34a; margin-bottom: 20px;">💸 Your refund has been processed!</h2>
          <p style="color: #374151; margin-bottom: 20px;">${orderData.customerName ? `Hi ${escapeHtml(orderData.customerName)},` : ""}</p>
          <p style="color: #374151; margin-bottom: 30px;">
            We have processed your refund for order #${orderData.referenceId}.
          </p>
          <p style="color: #b45309; font-size: 14px; margin-top: 16px;"><strong>Note:</strong> All product prices include VAT. Shipping is not included and will be paid separately on delivery. Shipping costs vary by location.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Refund Details</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> #${orderData.referenceId}</p>
            <p style="margin: 5px 0;"><strong>Amount Refunded:</strong> £${orderData.amount}</p>
            ${orderData.reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${escapeHtml(orderData.reason)}</p>` : ""}
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2025 ArchCool Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Your refund for order #${orderData.referenceId} has been processed. Amount: £${orderData.amount}${orderData.reason ? `\nReason: ${orderData.reason}` : ""}`,
  }),

  orderReadyToShip: (orderData: {
    referenceId: string;
    customerName: string;
    magicLink?: string;
  }) => ({
    subject: `🚚 Your Order is Ready to Ship - #${orderData.referenceId}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ArchCool</h1>
          <p style="color: #6b7280; margin: 5px 0;">Order Ready to Ship</p>
        </div>
        <div style="background: #e0f2fe; padding: 30px; border-radius: 12px; border: 1px solid #7dd3fc;">
          <h2 style="color: #0284c7; margin-bottom: 20px;">🚚 Your order is ready to ship!</h2>
          <p style="color: #374151; margin-bottom: 20px;">Hi ${escapeHtml(orderData.customerName)},</p>
          <p style="color: #374151; margin-bottom: 30px;">
            Great news! Your order <strong>#${orderData.referenceId}</strong> has been processed and is ready to ship.
            Your order will typically arrive within <strong>2-4 business days</strong>.
          </p>
          <p style="color: #b45309; font-size: 14px; margin-top: 16px;"><strong>Note:</strong> All product prices include VAT. Shipping is not included and will be paid separately on delivery. Shipping costs vary by location.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${orderData.magicLink || `${process.env.NEXT_PUBLIC_APP_URL}/my-orders/${orderData.referenceId}`}" style="display: inline-block; background: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Track Your Order
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2025 ArchCool Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Your order #${orderData.referenceId} is ready to ship and will arrive in 2-4 business days. Track at: ${orderData.magicLink || `${process.env.NEXT_PUBLIC_APP_URL}/my-orders/${orderData.referenceId}`}`,
  }),

  orderFulfilled: (orderData: {
    referenceId: string;
    customerName: string;
    magicLink?: string;
  }) => ({
    subject: `✅ Order Delivered - #${orderData.referenceId}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ArchCool</h1>
          <p style="color: #6b7280; margin: 5px 0;">Order Delivered</p>
        </div>
        <div style="background: #f0fdf4; padding: 30px; border-radius: 12px; border: 1px solid #bbf7d0;">
          <h2 style="color: #16a34a; margin-bottom: 20px;">✅ Thank you for your purchase!</h2>
          <p style="color: #374151; margin-bottom: 20px;">Hi ${escapeHtml(orderData.customerName)},</p>
          <p style="color: #374151; margin-bottom: 30px;">
            Your order <strong>#${orderData.referenceId}</strong> has been successfully delivered!
            We hope you love your new ArchCool products.
          </p>
          <p style="color: #374151; margin-bottom: 20px;">
            If you have any questions about your order or need support, please don't hesitate to contact us.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${orderData.magicLink || `${process.env.NEXT_PUBLIC_APP_URL}/my-orders/${orderData.referenceId}`}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Order Details
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2025 ArchCool Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Your order #${orderData.referenceId} has been delivered! Thank you for your purchase. View details at: ${orderData.magicLink || `${process.env.NEXT_PUBLIC_APP_URL}/my-orders/${orderData.referenceId}`}`,
  }),

  orderCancelled: (orderData: {
    referenceId: string;
    customerName: string;
    reason?: string;
  }) => ({
    subject: `❌ Order Cancelled - #${orderData.referenceId}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ArchCool</h1>
          <p style="color: #6b7280; margin: 5px 0;">Order Cancelled</p>
        </div>
        <div style="background: #fef2f2; padding: 30px; border-radius: 12px; border: 1px solid #fecaca;">
          <h2 style="color: #dc2626; margin-bottom: 20px;">❌ Order Cancelled</h2>
          <p style="color: #374151; margin-bottom: 20px;">Hi ${escapeHtml(orderData.customerName)},</p>
          <p style="color: #374151; margin-bottom: 30px;">
            Your order <strong>#${orderData.referenceId}</strong> has been cancelled.
            ${orderData.reason ? `<br/><br/><strong>Reason:</strong> ${escapeHtml(orderData.reason)}` : ""}
          </p>
          <p style="color: #374151; margin-bottom: 20px;">
            If you have any questions about this cancellation, please contact our support team.
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2025 ArchCool Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Your order #${orderData.referenceId} has been cancelled.${orderData.reason ? ` Reason: ${orderData.reason}` : ""}`,
  }),
};

// Email sending functions
export const emailService = {
  // Send OTP emails
  async sendOTP(
    email: string,
    otp: string,
    type: "sign-in" | "email-verification" | "forget-password",
  ) {
    // Debug: Log the OTP being sent
    console.log(`🔐 Sending ${type} OTP to ${email}`);

    let template;

    switch (type) {
      case "sign-in":
        template = emailTemplates.otpSignIn(otp);
        break;
      case "email-verification":
        template = emailTemplates.otpEmailVerification(otp);
        break;
      case "forget-password":
        template = emailTemplates.otpPasswordReset(otp);
        break;
      default:
        throw new Error("Invalid OTP type");
    }

    return await emailTransporter.sendMail({
      from: '"ArchCool Store" <archcool@archcoolstore.com>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },

  // Send magic link
  async sendMagicLink(email: string, url: string) {
    const template = emailTemplates.magicLink(url);

    return await emailTransporter.sendMail({
      from: '"ArchCool Store" <archcool@archcoolstore.com>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },

  // Send order status emails
  async sendOrderConfirmation(email: string, orderData: any) {
    const template = emailTemplates.orderConfirmed(orderData);

    return await emailTransporter.sendMail({
      from: '"ArchCool Store" <archcool@archcoolstore.com>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },

  async sendOrderShipped(email: string, orderData: any) {
    const template = emailTemplates.orderShipped(orderData);

    return await emailTransporter.sendMail({
      from: '"ArchCool Store" <archcool@archcoolstore.com>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },

  async sendPaymentConfirmed(email: string, orderData: any) {
    const template = emailTemplates.paymentConfirmed(orderData);

    return await emailTransporter.sendMail({
      from: '"ArchCool Store" <archcool@archcoolstore.com>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },

  async sendRefundConfirmation(
    email: string,
    orderData: {
      referenceId: string;
      customerName?: string;
      amount: number;
      reason?: string;
    },
  ) {
    const template = emailTemplates.refundConfirmation(orderData);
    return await emailTransporter.sendMail({
      from: '"ArchCool Store" <archcool@archcoolstore.com>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },

  async sendOrderReadyToShip(
    email: string,
    orderData: {
      referenceId: string;
      customerName: string;
      magicLink?: string;
    },
  ) {
    const template = emailTemplates.orderReadyToShip(orderData);
    return await emailTransporter.sendMail({
      from: '"ArchCool Store" <archcool@archcoolstore.com>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },

  async sendOrderFulfilled(
    email: string,
    orderData: {
      referenceId: string;
      customerName: string;
      magicLink?: string;
    },
  ) {
    const template = emailTemplates.orderFulfilled(orderData);
    return await emailTransporter.sendMail({
      from: '"ArchCool Store" <archcool@archcoolstore.com>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },

  async sendOrderCancelled(
    email: string,
    orderData: { referenceId: string; customerName: string; reason?: string },
  ) {
    const template = emailTemplates.orderCancelled(orderData);
    return await emailTransporter.sendMail({
      from: '"ArchCool Store" <archcool@archcoolstore.com>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },

  async sendContactSupport({
    name,
    email,
    message,
  }: {
    name: string;
    email: string;
    message: string;
  }) {
    const subject = `New Contact Form Submission from ${name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">${escapeHtml(message).replace(/\n/g, "<br/>")}</div>
      </div>
    `;
    const text = `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`;
    return await emailTransporter.sendMail({
      from: '"ArchCool Store" <archcool@archcoolstore.com>',
      to: "archcool@archcoolstore.com", // Change to your support email if needed
      subject,
      html,
      text,
    });
  },

  // Test email connection
  async testConnection() {
    try {
      await emailTransporter.verify();
      console.log("✅ Email service connected successfully");
      return true;
    } catch (error) {
      console.error("❌ Email service connection failed:", error);
      return false;
    }
  },
};

export default emailService;
