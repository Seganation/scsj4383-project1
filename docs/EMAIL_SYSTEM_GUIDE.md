# Email System Guide for Successful Payments

## 📧 How Email System Works

When a customer makes a successful payment, the system automatically sends **two emails** to the customer's email address:

### 1. **Order Confirmation Email**
- **Triggered**: When Stripe webhook receives `checkout.session.completed`
- **Content**: Order details, items purchased, total amount, tracking link
- **Template**: `orderConfirmed` in `app/lib/email.ts`

### 2. **Payment Confirmation Email**
- **Triggered**: Same webhook event
- **Content**: Payment confirmation, amount paid, order status
- **Template**: `paymentConfirmed` in `app/lib/email.ts`

## 🔄 Email Flow Process

```
Customer Payment → Stripe Webhook → Update Order Status → Send Emails
```

### Step-by-Step Process:

1. **Customer completes payment** on Stripe checkout
2. **Stripe sends webhook** to `/api/stripe/webhook`
3. **Webhook processes** `checkout.session.completed` event
4. **Order status updated** to "paid" in database
5. **Two emails sent** to customer's shipping email:
   - Order confirmation email
   - Payment confirmation email

## 📋 Email Templates Available

### Order Confirmation Email
- **Subject**: `🎉 Order Confirmed - #ORDER_ID`
- **Content**: 
  - Thank you message
  - Order details (ID, total, items)
  - Track order button
  - Next steps information

### Payment Confirmation Email
- **Subject**: `💳 Payment Confirmed - #ORDER_ID`
- **Content**:
  - Payment confirmation
  - Amount paid
  - Order preparation status
  - Shipping information

## 🧪 Testing the Email System

### Method 1: Web Interface
```bash
# Start development server
pnpm dev

# Visit test page
http://localhost:3000/test-email

# Enter your email and test different email types
```

### Method 2: API Testing
```bash
# Test OTP email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","type":"otp"}'

# Test order confirmation email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","type":"order"}'

# Test payment confirmation email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","type":"payment"}'
```

### Method 3: Script Testing
```bash
# Test all email types at once
node scripts/test-email-flow.js your@email.com
```

## 🔧 Email Configuration

### SMTP Settings (in `app/lib/email.ts`)
```javascript
host: "mail.privateemail.com"
port: 587
secure: false
auth: {
  user: "archcool@archcoolstore.com"
  pass: "Nazanim#77"
}
```

### Environment Variables Required
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # For email links
```

## 📊 Email Tracking

### Webhook Logs
The webhook logs email sending status:
```
✅ Order confirmation email sent to: customer@email.com
✅ Payment confirmation email sent to: customer@email.com
```

### Error Handling
- If email fails, webhook continues (doesn't fail payment)
- Errors are logged but don't affect order processing
- Email failures are logged for debugging

## 🚀 Production Deployment

### Before Going Live:
1. **Test email delivery** in production environment
2. **Verify SMTP credentials** work in production
3. **Test webhook** with real Stripe events
4. **Monitor email delivery** rates
5. **Set up email monitoring** for failures

### Production Checklist:
- [ ] Email templates look correct
- [ ] SMTP credentials work
- [ ] Webhook receives events
- [ ] Emails are delivered
- [ ] Links in emails work
- [ ] Error handling works

## 🐛 Troubleshooting

### Common Issues:

1. **Emails not sending**
   - Check SMTP credentials
   - Verify webhook is receiving events
   - Check server logs for errors

2. **Webhook not working**
   - Verify `STRIPE_WEBHOOK_SECRET` is correct
   - Check webhook URL in Stripe dashboard
   - Test with Stripe CLI locally

3. **Email delivery issues**
   - Check spam folder
   - Verify email address is correct
   - Test with different email providers

### Debugging Steps:
1. Check server logs for webhook events
2. Test email service connection
3. Verify order data in database
4. Test email templates manually

## 📝 Customization

### Email Templates
All templates are in `app/lib/email.ts`:
- `emailTemplates.orderConfirmed()` - Order confirmation
- `emailTemplates.paymentConfirmed()` - Payment confirmation
- `emailTemplates.otpSignIn()` - OTP emails
- `emailTemplates.magicLink()` - Magic link emails

### Branding
Update templates to match your brand:
- Colors
- Logo
- Fonts
- Contact information

---

**Status**: ✅ Email system fully configured and tested
**Last Updated**: July 11, 2025 