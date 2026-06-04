JWT
The JWT plugin provides endpoints to retrieve a JWT token and a JWKS endpoint to verify the token.

This plugin is not meant as a replacement for the session. It's meant to be used for services that require JWT tokens. If you're looking to use JWT tokens for authentication, check out the Bearer Plugin.

Installation
Add the plugin to your auth config
auth.ts

import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"

export const auth = betterAuth({
plugins: [
jwt(),
]
})
Migrate the database
Run the migration or generate the schema to add the necessary fields and tables to the database.

migrate
generate

npx @better-auth/cli migrate
See the Schema section to add the fields manually.

Usage
Once you've installed the plugin, you can start using the JWT & JWKS plugin to get the token and the JWKS through their respective endpoints.

JWT
Retrieve the token
Using your session token
To get the token, call the /token endpoint. This will return the following:

{
"token": "ey..."
}
Make sure to include the token in the Authorization header of your requests and the bearer plugin is added in your auth configuration.

await fetch("/api/auth/token", {
headers: {
"Authorization": `Bearer ${token}`
},
})
From set-auth-jwt header
When you call getSession method, a JWT is returned in the set-auth-jwt header, which you can use to send to your services directly.

await authClient.getSession({
fetchOptions: {
onSuccess: (ctx)=>{
const jwt = ctx.response.headers.get("set-auth-jwt")
}
}
})
Verifying the token
The token can be verified in your own service, without the need for an additional verify call or database check. For this JWKS is used. The public key can be fetched from the /api/auth/jwks endpoint.

Since this key is not subject to frequent changes, it can be cached indefinitely. The key ID (kid) that was used to sign a JWT is included in the header of the token. In case a JWT with a different kid is received, it is recommended to fetch the JWKS again.

{
"keys": [
{
"crv": "Ed25519",
"x": "bDHiLTt7u-VIU7rfmcltcFhaHKLVvWFy-_csKZARUEU",
"kty": "OKP",
"kid": "c5c7995d-0037-4553-8aee-b5b620b89b23"
}
]
}
Example using jose with remote JWKS

import { jwtVerify, createRemoteJWKSet } from 'jose'

async function validateToken(token: string) {
try {
const JWKS = createRemoteJWKSet(
new URL('http://localhost:3000/api/auth/jwks')
)
const { payload } = await jwtVerify(token, JWKS, {
issuer: 'http://localhost:3000', // Should match your JWT issuer, which is the BASE_URL
audience: 'http://localhost:3000', // Should match your JWT audience, which is the BASE_URL by default
})
return payload
} catch (error) {
console.error('Token validation failed:', error)
throw error
}
}

// Usage example
const token = 'your.jwt.token' // this is the token you get from the /api/auth/token endpoint
const payload = await validateToken(token)
Example with local JWKS

import { jwtVerify, createLocalJWKSet } from 'jose'

async function validateToken(token: string) {
try {
/\*\*
_ This is the JWKS that you get from the /api/auth/
_ jwks endpoint
\*/
const storedJWKS = {
keys: [{
//...
}]
};
const JWKS = createLocalJWKSet({
keys: storedJWKS.data?.keys!,
})
const { payload } = await jwtVerify(token, JWKS, {
issuer: 'http://localhost:3000', // Should match your JWT issuer, which is the BASE_URL
audience: 'http://localhost:3000', // Should match your JWT audience, which is the BASE_URL by default
})
return payload
} catch (error) {
console.error('Token validation failed:', error)
throw error
}
}

// Usage example
const token = 'your.jwt.token' // this is the token you get from the /api/auth/token endpoint
const payload = await validateToken(token)
Schema
The JWT plugin adds the following tables to the database:

JWKS
Table Name: jwks

Field Name Type Key Description
id string PK Unique identifier for each web key
publicKey string - The public part of the web key
privateKey string - The private part of the web key
createdAt Date - Timestamp of when the web key was created
Options
Algorithm of the Key Pair
The algorithm used for the generation of the key pair. The default is EdDSA with the Ed25519 curve. Below are the available options:

auth.ts

jwt({
jwks: {
keyPairConfig: {
alg: "EdDSA",
crv: "Ed25519"
}
}
})
EdDSA
Default Curve: Ed25519
Optional Property: crv
Available options: Ed25519, Ed448
Default: Ed25519
ES256
No additional properties
RSA256
Optional Property: modulusLength
Expects a number
Default: 2048
PS256
Optional Property: modulusLength
Expects a number
Default: 2048
ECDH-ES
Optional Property: crv
Available options: P-256, P-384, P-521
Default: P-256
ES512
No additional properties
Disable private key encryption
By default, the private key is encrypted using AES256 GCM. You can disable this by setting the disablePrivateKeyEncryption option to true.

For security reasons, it's recommended to keep the private key encrypted.

auth.ts

jwt({
jwks: {
disablePrivateKeyEncryption: true
}
})
Modify JWT payload
By default the entire user object is added to the JWT payload. You can modify the payload by providing a function to the definePayload option.

auth.ts

jwt({
jwt: {
definePayload: ({user}) => {
return {
id: user.id,
email: user.email,
role: user.role
}
}
}
})
Modify Issuer, Audience, Subject or Expiration time
If none is given, the BASE_URL is used as the issuer and the audience is set to the BASE_URL. The expiration time is set to 15 minutes.

auth.ts

jwt({
jwt: {
issuer: "https://example.com",
audience: "https://example.com",
expirationTime: "1h",
getSubject: (session) => {
// by default the subject is the user id
return session.user.email
}
}
})
