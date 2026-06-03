// Test script to verify name extraction from email addresses
function extractNameFromEmail(email) {
  if (!email) return null;
  
  // Extract name from email (e.g., "rawa@example.com" -> "rawa")
  const emailName = email.split('@')[0];
  // Capitalize first letter and replace dots/underscores with spaces
  const customerName = emailName
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  return customerName;
}

// Test cases
const testEmails = [
  'rawa@example.com',
  'john.doe@company.com',
  'jane_smith@domain.org',
  'user123@test.net',
  'first.last@email.co.uk',
  'guest@example.com'
];

console.log('🧪 Testing name extraction from email addresses:');
console.log('');

testEmails.forEach(email => {
  const extractedName = extractNameFromEmail(email);
  console.log(`📧 ${email} → 👤 ${extractedName}`);
});

console.log('');
console.log('✅ Name extraction test completed!');
console.log('');
console.log('Expected behavior:');
console.log('- "rawa@example.com" → "Rawa"');
console.log('- "john.doe@company.com" → "John Doe"');
console.log('- "jane_smith@domain.org" → "Jane Smith"');
console.log('- "user123@test.net" → "User123"');
console.log('- "first.last@email.co.uk" → "First Last"');
console.log('- "guest@example.com" → "Guest"'); 