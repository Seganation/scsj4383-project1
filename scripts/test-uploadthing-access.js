// Test UploadThing public access on free plan
const testUrl = "https://utfs.io/f/does-not-exist";

console.log("Testing UploadThing URL structure...");
console.log("URL:", testUrl);

fetch(testUrl, { method: "HEAD" })
  .then((res) => {
    console.log("\nStatus:", res.status);
    console.log("Status Text:", res.statusText);
    console.log("\nUploadThing response headers:");
    res.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
  })
  .catch((err) => {
    console.log("Fetch error:", err.message);
  });
