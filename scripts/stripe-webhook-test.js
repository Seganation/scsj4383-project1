#!/usr/bin/env node

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testWebhook() {
  try {
    console.log('🔧 Testing Stripe webhook functionality...\n');

    // Create a test checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Test Product',
              description: 'Test product for webhook testing',
            },
            unit_amount: 2000, // £20.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/payment/cancel',
      metadata: {
        orderId: 'TEST-ORDER-' + Date.now(),
        userId: 'test-user',
        isGuest: 'true',
        createAccount: 'false',
      },
    });

    console.log('✅ Test checkout session created:');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   URL: ${session.url}`);
    console.log(`   Order ID: ${session.metadata.orderId}\n`);

    // Simulate a successful payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000,
      currency: 'gbp',
      payment_method_types: ['card'],
      metadata: {
        orderId: session.metadata.orderId,
      },
    });

    console.log('✅ Test payment intent created:');
    console.log(`   Payment Intent ID: ${paymentIntent.id}\n`);

    // Instructions for testing
    console.log('📋 Next steps for testing:');
    console.log('1. Install Stripe CLI: https://stripe.com/docs/stripe-cli');
    console.log('2. Login to Stripe: stripe login');
    console.log('3. Forward webhooks to localhost:');
    console.log('   stripe listen --forward-to localhost:3000/api/stripe/webhook');
    console.log('4. Use the test card: 4242 4242 4242 4242');
    console.log('5. Complete the checkout at the URL above');
    console.log('6. Check your server logs for webhook events\n');

    console.log('🔗 Test checkout URL:');
    console.log(session.url);
    console.log('\n📧 Check your email for order confirmation');

  } catch (error) {
    console.error('❌ Error testing webhook:', error);
  }
}

// Check if STRIPE_SECRET_KEY is set
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.log('Please set it in your .env.local file');
  process.exit(1);
}

testWebhook(); 