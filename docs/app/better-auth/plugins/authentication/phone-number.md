Phone Number
The phone number plugin extends the authentication system by allowing users to sign in and sign up using their phone number. It includes OTP (One-Time Password) functionality to verify phone numbers.

Installation
Add Plugin to the server
auth.ts

import { betterAuth } from "better-auth"
import { phoneNumber } from "better-auth/plugins"

const auth = betterAuth({
plugins: [
phoneNumber({
sendOTP: ({ phoneNumber, code }, request) => {
// Implement sending OTP code via SMS
}
})
]
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
import { phoneNumberClient } from "better-auth/client/plugins"

const authClient = createAuthClient({
plugins: [
phoneNumberClient()
]
})
Usage
Send OTP for Verification
To send an OTP to a user's phone number for verification, you can use the sendVerificationCode endpoint.

auth-client.ts

await authClient.phoneNumber.sendOtp({
phoneNumber: "+1234567890"
})
Verify Phone Number
After the OTP is sent, users can verify their phone number by providing the code.

auth-client.ts

const isVerified = await authClient.phoneNumber.verify({
phoneNumber: "+1234567890",
code: "123456"
})
When the phone number is verified, the phoneNumberVerified field in the user table is set to true. If disableSession is not set to true, a session is created for the user. Additionally, if callbackOnVerification is provided, it will be called.

Allow Sign-Up with Phone Number
To allow users to sign up using their phone number, you can pass signUpOnVerification option to your plugin configuration. It requires you to pass getTempEmail function to generate a temporary email for the user.

auth.ts

export const auth = betterAuth({
plugins: [
phoneNumber({
sendOTP: ({ phoneNumber, code }, request) => {
// Implement sending OTP code via SMS
},
signUpOnVerification: {
getTempEmail: (phoneNumber) => {
return `${phoneNumber}@my-site.com`
},
//optionally, you can also pass `getTempName` function to generate a temporary name for the user
getTempName: (phoneNumber) => {
return phoneNumber //by default, it will use the phone number as the name
}
}
})
]
})
Sign In with Phone Number
In addition to signing in a user using send-verify flow, you can also use phone number as an identifier and sign in a user using phone number and password.

await authClient.signIn.phoneNumber({
phoneNumber: "+123456789",
password: "password",
rememberMe: true //optional defaults to true
})
Update Phone Number
Updating phone number uses the same process as verifying a phone number. The user will receive an OTP code to verify the new phone number.

auth-client.ts

await authClient.phoneNumber.sendOtp({
phoneNumber: "+1234567890" // New phone number
})
Then verify the new phone number with the OTP code.

auth-client.ts

const isVerified = await authClient.phoneNumber.verify({
phoneNumber: "+1234567890",
code: "123456",
updatePhoneNumber: true // Set to true to update the phone number
})
If a user session exist the phone number will be updated automatically.

Disable Session Creation
By default, the plugin creates a session for the user after verifying the phone number. You can disable this behavior by passing disableSession: true to the verify method.

auth-client.ts

const isVerified = await authClient.phoneNumber.verify({
phoneNumber: "+1234567890",
code: "123456",
disableSession: true
})
Request Password Reset
To initiate a request password reset flow using phoneNumber, you can start by calling requestPasswordReset on the client to send an OTP code to the user's phone number.

auth-client.ts

await authClient.phoneNumber.requestPasswordReset({
phoneNumber: "+1234567890"
})
Then, you can reset the password by calling resetPassword on the client with the OTP code and the new password.

auth-client.ts

const isVerified = await authClient.phoneNumber.resetPassword({
otp: "123456", // OTP code sent to the user's phone number
phoneNumber: "+1234567890",
newPassword: "newPassword"
})
Options
otpLength: The length of the OTP code to be generated. Default is 6.
sendOTP: A function that sends the OTP code to the user's phone number. It takes the phone number and the OTP code as arguments.
expiresIn: The time in seconds after which the OTP code expires. Default is 300 seconds.
callbackOnVerification: A function that is called after the phone number is verified. It takes the phone number and the user object as the first argument and a request object as the second argument.

export const auth = betterAuth({
plugins: [
phoneNumber({
sendOTP: ({ phoneNumber, code }, request) => {
// Implement sending OTP code via SMS
},
callbackOnVerification: async ({ phoneNumber, user }, request) => {
// Implement callback after phone number verification
}
})
]
})
sendPasswordResetOTP: A function that sends the OTP code to the user's phone number for password reset. It takes the phone number and the OTP code as arguments.

phoneNumberValidator: A custom function to validate the phone number. It takes the phone number as an argument and returns a boolean indicating whether the phone number is valid.

signUpOnVerification: An object with the following properties:

getTempEmail: A function that generates a temporary email for the user. It takes the phone number as an argument and returns the temporary email.
getTempName: A function that generates a temporary name for the user. It takes the phone number as an argument and returns the temporary name.
requireVerification: When enabled, users cannot sign in with their phone number until it has been verified. If an unverified user attempts to sign in, the server will respond with a 401 error (PHONE_NUMBER_NOT_VERIFIED) and automatically trigger an OTP send to start the verification process.

Schema
The plugin requires 2 fields to be added to the user table

User Table
Field Name Type Key Description
phoneNumber string ? The phone number of the user
phoneNumberVerified boolean ? Whether the phone number is verified or not
OTP Verification Attempts
The phone number plugin includes a built-in protection against brute force attacks by limiting the number of verification attempts for each OTP code.

phoneNumber({
allowedAttempts: 3, // default is 3
// ... other options
})
When a user exceeds the allowed number of verification attempts:

The OTP code is automatically deleted
Further verification attempts will return a 403 (Forbidden) status with "Too many attempts" message
The user will need to request a new OTP code to continue
Example error response after exceeding attempts:

{
"error": {
"status": 403,
"message": "Too many attempts"
}
}
