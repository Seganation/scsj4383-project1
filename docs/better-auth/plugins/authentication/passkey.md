Passkey
Passkeys are a secure, passwordless authentication method using cryptographic key pairs, supported by WebAuthn and FIDO2 standards in web browsers. They replace passwords with unique key pairs: a private key stored on the user's device and a public key shared with the website. Users can log in using biometrics, PINs, or security keys, providing strong, phishing-resistant authentication without traditional passwords.

The passkey plugin implementation is powered by SimpleWebAuthn behind the scenes.

Installation
Add the plugin to your auth config
To add the passkey plugin to your auth config, you need to import the plugin and pass it to the plugins option of the auth instance.

Options

rpID: A unique identifier for your website. 'localhost' is okay for local dev

rpName: Human-readable title for your website

origin: The URL at which registrations and authentications should occur. http://localhost and http://localhost:PORT are also valid. Do NOT include any trailing /

authenticatorSelection: Allows customization of WebAuthn authenticator selection criteria. Leave unspecified for default settings.

authenticatorAttachment: Specifies the type of authenticator
platform: Authenticator is attached to the platform (e.g., fingerprint reader)
cross-platform: Authenticator is not attached to the platform (e.g., security key)
Default: not set (both platform and cross-platform allowed, with platform preferred)
residentKey: Determines credential storage behavior.
required: User MUST store credentials on the authenticator (highest security)
preferred: Encourages credential storage but not mandatory
discouraged: No credential storage required (fastest experience)
Default: preferred
userVerification: Controls biometric/PIN verification during authentication:
required: User MUST verify identity (highest security)
preferred: Verification encouraged but not mandatory
discouraged: No verification required (fastest experience)
Default: preferred
auth.ts

import { betterAuth } from "better-auth"
import { passkey } from "better-auth/plugins/passkey"

export const auth = betterAuth({
plugins: [
passkey(),
],
})
Migrate the database
Run the migration or generate the schema to add the necessary fields and tables to the database.

migrate
generate

npx @better-auth/cli migrate
See the Schema section to add the fields manually.

Add the client plugin
auth-client.ts

import { createAuthClient } from "better-auth/client"
import { passkeyClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
plugins: [
passkeyClient()
]
})
Usage
Add/Register a passkey
To add or register a passkey make sure a user is authenticated and then call the passkey.addPasskey function provided by the client.

// Default behavior allows both platform and cross-platform passkeys
const { data, error } = await authClient.passkey.addPasskey();
This will prompt the user to register a passkey. And it'll add the passkey to the user's account.

You can also specify the type of authenticator you want to register. The authenticatorAttachment can be either platform or cross-platform.

// Register a cross-platform passkey showing only a QR code
// for the user to scan as well as the option to plug in a security key
const { data, error } = await authClient.passkey.addPasskey({
authenticatorAttachment: 'cross-platform'
});
Sign in with a passkey
To sign in with a passkey you can use the passkeySignIn method. This will prompt the user to sign in with their passkey.

Signin method accepts:

autoFill: Browser autofill, a.k.a. Conditional UI. read more

email: The email of the user to sign in.

fetchOptions: Fetch options to pass to the fetch request.

const data = await authClient.signIn.passkey();
Conditional UI
The plugin supports conditional UI, which allows the browser to autofill the passkey if the user has already registered a passkey.

There are two requirements for conditional UI to work:

Update input fields
Add the autocomplete attribute with the value webauthn to your input fields. You can add this attribute to multiple input fields, but at least one is required for conditional UI to work.

The webauthn value should also be the last entry of the autocomplete attribute.

<label for="name">Username:</label>
<input type="text" name="name" autocomplete="username webauthn">
<label for="password">Password:</label>
<input type="password" name="password" autocomplete="current-password webauthn">
Preload the passkeys
When your component mounts, you can preload the user's passkeys by calling the authClient.signIn.passkey method with the autoFill option set to true.

To prevent unnecessary calls, we will also add a check to see if the browser supports conditional UI.

React

useEffect(() => {
if (!PublicKeyCredential.isConditionalMediationAvailable ||
!PublicKeyCredential.isConditionalMediationAvailable()) {
return;
}

void authClient.signIn.passkey({ autoFill: true })
}, [])
Depending on the browser, a prompt will appear to autofill the passkey. If the user has multiple passkeys, they can select the one they want to use.

Some browsers also require the user to first interact with the input field before the autofill prompt appears.

Debugging
To test your passkey implementation you can use emulated authenticators. This way you can test the registration and sign-in process without even owning a physical device.

Schema
The plugin require a new table in the database to store passkey data.

Table Name: passkey

Field Name Type Key Description
id string PK Unique identifier for each passkey
name string ? The name of the passkey
publicKey string - The public key of the passkey
userId string FK The ID of the user
credentialID string - The unique identifier of the registered credential
counter number - The counter of the passkey
deviceType string - The type of device used to register the passkey
backedUp boolean - Whether the passkey is backed up
transports string - The transports used to register the passkey
createdAt Date - The time when the passkey was created
aaguid string ? Authenticator's Attestation GUID indicating the type of the authenticator
Options
rpID: A unique identifier for your website. 'localhost' is okay for local dev.

rpName: Human-readable title for your website.

origin: The URL at which registrations and authentications should occur. http://localhost and http://localhost:PORT are also valid. Do NOT include any trailing /.

authenticatorSelection: Allows customization of WebAuthn authenticator selection criteria. When unspecified, both platform and cross-platform authenticators are allowed with preferred settings for residentKey and userVerification.

aaguid: (optional) Authenticator Attestation GUID. This is a unique identifier for the passkey provider (device or authenticator type) and can be used to identify the type of passkey device used during registration or authentication.
