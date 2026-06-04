Captcha
The Captcha Plugin integrates bot protection into your Better Auth system by adding captcha verification for key endpoints. This plugin ensures that only human users can perform actions like signing up, signing in, or resetting passwords. The following providers are currently supported:

Google reCAPTCHA
Cloudflare Turnstile
hCaptcha
This plugin works out of the box with Email & Password authentication. To use it with other authentication methods, you will need to configure the endpoints array in the plugin options.

Installation
Add the plugin to your auth config
auth.ts

import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";

export const auth = betterAuth({
plugins: [
captcha({
provider: "cloudflare-turnstile", // or google-recaptcha, hcaptcha
secretKey: process.env.TURNSTILE_SECRET_KEY!,
}),
],
});
Add the captcha token to your request headers
Add the captcha token to your request headers for all protected endpoints. This example shows how to include it in a signIn request:

await authClient.signIn.email({
email: "user@example.com",
password: "secure-password",
fetchOptions: {
headers: {
"x-captcha-response": turnstileToken,
"x-captcha-user-remote-ip": userIp, // optional: forwards the user's IP address to the captcha service
},
},
});
To implement Cloudflare Turnstile on the client side, follow the official Cloudflare Turnstile documentation or use a library like react-turnstile.
To implement Google reCAPTCHA on the client side, follow the official Google reCAPTCHA documentation or use libraries like react-google-recaptcha (v2) and react-google-recaptcha-v3 (v3).
To implement hCaptcha on the client side, follow the official hCaptcha documentation or use libraries like @hcaptcha/react-hcaptcha
How it works
The plugin acts as a middleware: it intercepts all POST requests to configured endpoints (see endpoints in the Plugin Options section).

it validates the captcha token on the server, by calling the captcha provider's /siteverify.

if the token is missing, gets rejected by the captcha provider, or if the /siteverify endpoint is unavailable, the plugin returns an error and interrupts the request.
if the token is accepted by the captcha provider, the middleware returns undefined, meaning the request is allowed to proceed.
Plugin Options
provider (required): your captcha provider.
secretKey (required): your provider's secret key used for the server-side validation.
endpoints (optional): overrides the default array of paths where captcha validation is enforced. Default is: ["/sign-up/email", "/sign-in/email", "/forget-password",].
minScore (optional - only Google ReCAPTCHA v3): minimum score threshold. Default is 0.5.
siteKey (optional - only hCaptcha): prevents tokens issued on one sitekey from being redeemed elsewhere.
siteVerifyURLOverride (optional): overrides endpoint URL for the captcha verification request.
