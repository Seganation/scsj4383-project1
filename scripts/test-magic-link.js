const crypto = require("node:crypto");

// Test the same token generation method used in webhook
function generateMagicLinkToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Test several tokens
console.log("Testing magic link token generation:");
for (let i = 0; i < 5; i++) {
  const token = generateMagicLinkToken();
  console.log(`Token ${i + 1}: ${token} (length: ${token.length})`);
}

// Test the token you're getting in production
const productionToken = "efd52f65d449975a5c181651f703646cff09b85aa0155950fc34b5336afd9a96";
console.log(`\nProduction token: ${productionToken} (length: ${productionToken.length})`);

// Check if it matches the expected pattern
const hexPattern = /^[a-f0-9]+$/i;
console.log(`Production token is valid hex: ${hexPattern.test(productionToken)}`);
console.log(`Production token length is 64: ${productionToken.length === 64}`);

// Test URL encoding/decoding
const testUrl = `https://archcoolstore.com/my-orders/ORD-250729-034?verify=${productionToken}`;
console.log(`\nTest URL: ${testUrl}`);
console.log(`URL encoded token: ${encodeURIComponent(productionToken)}`);
console.log(`URL decoded token: ${decodeURIComponent(productionToken)}`); 