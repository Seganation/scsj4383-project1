const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testShippingWebhook() {
  console.log('🧪 Testing shipping webhook capture...');
  
  try {
    // Create a test checkout session with shipping address collection
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Test Product',
          },
          unit_amount: 1000, // £10.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      customer_creation: 'always',
      success_url: 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/payment/cancel',
      metadata: {
        orderId: 'test-order-123',
        userId: 'test-user-456',
        isGuest: 'true',
      },
    });

    console.log('✅ Test checkout session created:');
    console.log('Session ID:', session.id);
    console.log('URL:', session.url);
    console.log('\n📋 Session configuration:');
    console.log('- billing_address_collection:', session.billing_address_collection);
    console.log('- shipping_address_collection:', session.shipping_address_collection);
    console.log('- customer_creation:', session.customer_creation);
    
    console.log('\n🔗 Please complete the checkout at the URL above to test webhook capture.');
    console.log('After payment, check your webhook logs to see if shipping details are captured.');
    
  } catch (error) {
    console.error('❌ Error creating test session:', error);
  }
}

// Run the test
testShippingWebhook(); 