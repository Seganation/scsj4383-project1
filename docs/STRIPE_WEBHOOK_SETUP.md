# Stripe Webhook Setup

## 🎯 **WEBHOOK ENDPOINT TO USE IN STRIPE DASHBOARD:**

```
https://yourdomain.com/api/stripe/webhook
```

## 📋 **EVENTS TO ENABLE IN STRIPE DASHBOARD:**

### **🛒 Checkout:**
- `checkout.session.completed`

### **💳 Payment Intents:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `payment_intent.amount_capturable_updated`

### **💰 Charges:**
- `charge.succeeded`
- `charge.dispute.created`

### **📄 Invoices:**
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.payment_action_required`
- `invoice.upcoming`
- `invoice.marked_uncollectible`
- `invoice.payment_succeeded`

### **👥 Customer Subscriptions:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.paused`
- `customer.subscription.resumed`
- `customer.subscription.pending_update_applied`
- `customer.subscription.pending_update_expired`
- `customer.subscription.trial_will_end`

## ⚙️ **STRIPE DASHBOARD STEPS:**

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://yourdomain.com/api/stripe`
4. **Select all events listed above**
5. **Copy the webhook secret** and add to your `.env`:
   ```
   STRIPE_SECRET_WEBHOOK=whsec_your_secret_here
   ```

## 🚨 **CRITICAL EVENTS (Must Have):**
- `checkout.session.completed` - Updates order status
- `charge.dispute.created` - Handles disputes
- `payment_intent.succeeded` - Confirms payments
- `payment_intent.payment_failed` - Handles failures

That's it! Enable these events and you're good to go. 