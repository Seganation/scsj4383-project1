#!/usr/bin/env node

const fetch = require('node-fetch');

async function testEmailFlow() {
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('🧪 Testing Email Flow...\n');
  console.log(`📧 Test email: ${testEmail}\n`);

  const emailTypes = ['otp', 'order', 'payment'];
  
  for (const type of emailTypes) {
    try {
      console.log(`📤 Testing ${type.toUpperCase()} email...`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail, type }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ ${type.toUpperCase()} email sent successfully!`);
        if (data.otp) {
          console.log(`   OTP Code: [REDACTED FOR SECURITY]`);
        }
      } else {
        console.log(`❌ ${type.toUpperCase()} email failed:`, data.error);
      }
    } catch (error) {
      console.log(`❌ ${type.toUpperCase()} email error:`, error.message);
    }
    
    console.log('');
  }

  console.log('🎉 Email flow test completed!');
  console.log('📧 Check your email inbox for the test emails.');
}

// Check if email is provided
if (process.argv.length < 3) {
  console.log('Usage: node scripts/test-email-flow.js <email>');
  console.log('Example: node scripts/test-email-flow.js your@email.com');
  process.exit(1);
}

testEmailFlow(); 