API Key
The API Key plugin allows you to create and manage API keys for your application. It provides a way to authenticate and authorize API requests by verifying API keys.

Features
Create, manage, and verify API keys
Built-in rate limiting
Custom expiration times, remaining count, and refill systems
metadata for API keys
Custom prefix
Sessions from API keys
Installation
Add Plugin to the server
auth.ts

import { betterAuth } from "better-auth"
import { apiKey } from "better-auth/plugins"

export const auth = betterAuth({
plugins: [
apiKey()
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
import { apiKeyClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
plugins: [
apiKeyClient()
]
})
Usage
You can view the list of API Key plugin options here.

Create an API key
/api-key/create
Client
Server

const { data: apiKey, error } = await authClient.apiKey.create({
name: "My API Key",
expiresIn: 60 _ 60 _ 24 \* 7, // 7 days
prefix: "my_app",
metadata: {
tier: "premium",
},
});
All API keys are assigned to a user. If you're creating an API key on the server, without access to headers, you must pass the userId property. This is the ID of the user that the API key is associated with.

Properties
All properties are optional. However if you pass a refillAmount, you must also pass a refillInterval, and vice versa.

name?: The name of the API key.
expiresIn?: The expiration time of the API key in seconds. If not provided, the API key will never expire.
prefix?: The prefix of the API key. This is used to identify the API key in the database.
metadata?: The metadata of the API key. This is used to store additional information about the API key.
Server Only Properties
remaining?: The remaining number of requests for the API key. If null, then there is no cap to key usage.
refillAmount?: The amount to refill the remaining count of the API key.
refillInterval?: The interval to refill the API key in milliseconds.
rateLimitTimeWindow?: The duration in milliseconds where each request is counted. Once the rateLimitMax is reached, the request will be rejected until the timeWindow has passed, at which point the time window will be reset.
rateLimitMax?: The maximum number of requests allowed within the rateLimitTimeWindow.
rateLimitEnabled?: Whether rate limiting is enabled for the API key.
permissions?: Permissions for the API key, structured as a record mapping resource types to arrays of allowed actions.

const example = {
projects: ["read", "read-write"],
};
userId?: The ID of the user associated with the API key. When creating an API Key, you must pass the headers of the user who will own the key. However if you do not have the headers, you can pass this field, which will allow you to bypass the need for headers.
Result
It'll return the ApiKey object which includes the key value for you to use. Otherwise if it throws, it will throw an APIError.

Verify an API key
/api-key/verify

const { valid, error, key } = await auth.api.verifyApiKey({
body: {
key: "your_api_key_here",
},
});

//with permissions check
const { valid, error, key } = await auth.api.verifyApiKey({
body: {
key: "your_api_key_here",
permissions: {
projects: ["read", "read-write"],
},
},
});
Properties
key: The API Key to validate
permissions?: The permissions to check against the API key.
Result

type Result = {
valid: boolean;
error: { message: string; code: string } | null;
key: Omit<ApiKey, "key"> | null;
};
Get an API key
/api-key/get

const key = await auth.api.getApiKey({
body: {
keyId: "your_api_key_id_here",
},
});
Properties
keyId: The API key ID to get information on.
Result
You'll receive everything about the API key details, except for the key value itself. If it fails, it will throw an APIError.

type Result = Omit<ApiKey, "key">;
Update an API key
/api-key/update
Client
Server

const { data: apiKey, error } = await authClient.apiKey.update({
keyId: "your_api_key_id_here",
name: "New API Key Name",
enabled: false,
});
Properties
Client

- keyId: The API key ID to update on. - name?: Update the key name.

Server Only

- userId?: Update the user ID who owns this key. - name?: Update the key name. - enabled?: Update whether the API key is enabled or not. - remaining?: Update the remaining count. - refillAmount?: Update the amount to refill the remaining count every interval. - refillInterval?: Update the interval to refill the remaining count. - metadata?: Update the metadata of the API key. - expiresIn?: Update the expiration time of the API key. In seconds. - rateLimitEnabled?: Update whether the rate-limiter is enabled or not. - rateLimitTimeWindow?: Update the time window for the rate-limiter. - rateLimitMax?: Update the maximum number of requests they can make during the rate-limit-time-window.

Result
If fails, throws APIError. Otherwise, you'll receive the API Key details, except for the key value itself.

Delete an API Key
/api-key/delete
Client
Server

const { data: result, error } = await authClient.apiKey.delete({
keyId: "your_api_key_id_here",
});
Properties
keyId: The API key ID to delete.
Result
If fails, throws APIError. Otherwise, you'll receive:

type Result = {
success: boolean;
};
List API keys
/api-key/list
Client
Server

const { data: apiKeys, error } = await authClient.apiKey.list();
Result
If fails, throws APIError. Otherwise, you'll receive:

type Result = ApiKey[];
Delete all expired API keys
This function will delete all API keys that have an expired expiration date.

/api-key/delete-all-expired-api-keys
ts await auth.api.deleteAllExpiredApiKeys();

We automatically delete expired API keys every time any apiKey plugin endpoints were called, however they are rate-limited to a 10 second cool down each call to prevent multiple calls to the database.

Sessions from API keys
Any time an endpoint in Better Auth is called that has a valid API key in the headers, we will automatically create a mock session to represent the user.

The default header key is x-api-key, but this can be changed by setting the apiKeyHeaders option in the plugin options.

export const auth = betterAuth({
plugins: [
apiKey({
apiKeyHeaders: ["x-api-key", "xyz-api-key"], // or you can pass just a string, eg: "x-api-key"
}),
],
});
Or optionally, you can pass an apiKeyGetter function to the plugin options, which will be called with the GenericEndpointContext, and from there, you should return the API key, or null if the request is invalid.

export const auth = betterAuth({
plugins: [
apiKey({
apiKeyGetter: (ctx) => {
const has = ctx.request.headers.has("x-api-key");
if (!has) return null;
return ctx.request.headers.get("x-api-key");
},
}),
],
});
Rate Limiting
Every API key can have its own rate limit settings, however, the built-in rate-limiting only applies to the verification process for a given API key. For every other endpoint/method, you should utilize Better Auth's built-in rate-limiting.

You can refer to the rate-limit default configurations below in the API Key plugin options.

An example default value:

export const auth = betterAuth({
plugins: [
apiKey({
rateLimit: {
enabled: true,
timeWindow: 1000 * 60 * 60 * 24, // 1 day
maxRequests: 10, // 10 requests per day
},
}),
],
});
For each API key, you can customize the rate-limit options on create.

You can only customize the rate-limit options on the server auth instance.

const apiKey = await auth.api.createApiKey({
body: {
rateLimitEnabled: true,
rateLimitTimeWindow: 1000 _ 60 _ 60 \* 24, // 1 day
rateLimitMax: 10, // 10 requests per day
},
headers: user_headers,
});
How does it work?
For each request, a counter (internally called requestCount) is incremented.
If the rateLimitMax is reached, the request will be rejected until the timeWindow has passed, at which point the timeWindow will be reset.

Remaining, refill, and expiration
The remaining count is the number of requests left before the API key is disabled.
The refill interval is the interval in milliseconds where the remaining count is refilled by day.
The expiration time is the expiration date of the API key.

How does it work?
Remaining:
Whenever an API key is used, the remaining count is updated.
If the remaining count is null, then there is no cap to key usage.
Otherwise, the remaining count is decremented by 1.
If the remaining count is 0, then the API key is disabled & removed.

refillInterval & refillAmount:
Whenever an API key is created, the refillInterval and refillAmount are set to null.
This means that the API key will not be refilled automatically.
However, if refillInterval & refillAmount are set, then the API key will be refilled accordingly.

Expiration:
Whenever an API key is created, the expiresAt is set to null.
This means that the API key will never expire.
However, if the expiresIn is set, then the API key will expire after the expiresIn time.

Custom Key generation & verification
You can customize the key generation and verification process straight from the plugin options.

Here's an example:

export const auth = betterAuth({
plugins: [
apiKey({
customKeyGenerator: (options: {
length: number;
prefix: string | undefined;
}) => {
const apiKey = mySuperSecretApiKeyGenerator(
options.length,
options.prefix
);
return apiKey;
},
customAPIKeyValidator: ({ ctx, key }) => {
if (key.endsWith("_super_secret_api_key")) {
return true;
} else {
return false;
}
},
}),
],
});
If you're not using the length property provided by customKeyGenerator, you must set the defaultKeyLength property to how long generated keys will be.

export const auth = betterAuth({
plugins: [
apiKey({
customKeyGenerator: () => {
return crypto.randomUUID();
},
defaultKeyLength: 36 // Or whatever the length is
})
]
});
If an API key is validated from your customAPIKeyValidator, we still must match that against the database's key. However, by providing this custom function, you can improve the performance of the API key verification process, as all failed keys can be invalidated without having to query your database.

Metadata
We allow you to store metadata alongside your API keys. This is useful for storing information about the key, such as a subscription plan for example.

To store metadata, make sure you haven't disabled the metadata feature in the plugin options.

export const auth = betterAuth({
plugins: [
apiKey({
enableMetadata: true,
}),
],
});
Then, you can store metadata in the metadata field of the API key object.

const apiKey = await auth.api.createApiKey({
body: {
metadata: {
plan: "premium",
},
},
});
You can then retrieve the metadata from the API key object.

const apiKey = await auth.api.getApiKey({
body: {
keyId: "your_api_key_id_here",
},
});

console.log(apiKey.metadata.plan); // "premium"
API Key plugin options
apiKeyHeaders string | string[];

The header name to check for API key. Default is x-api-key.

customAPIKeyGetter (ctx: GenericEndpointContext) => string | null

A custom function to get the API key from the context.

customAPIKeyValidator (options: { ctx: GenericEndpointContext; key: string; }) => boolean

A custom function to validate the API key.

customKeyGenerator (options: { length: number; prefix: string | undefined; }) => string | Promise<string>

A custom function to generate the API key.

startingCharactersConfig { shouldStore?: boolean; charactersLength?: number; }

Customize the starting characters configuration.

startingCharactersConfig Options
defaultKeyLength number

The length of the API key. Longer is better. Default is 64. (Doesn't include the prefix length)

defaultPrefix string

The prefix of the API key.

Note: We recommend you append an underscore to the prefix to make the prefix more identifiable. (eg hello\_)

maximumPrefixLength number

The maximum length of the prefix.

minimumPrefixLength number

The minimum length of the prefix.

maximumNameLength number

The maximum length of the name.

minimumNameLength number

The minimum length of the name.

enableMetadata boolean

Whether to enable metadata for an API key.

keyExpiration { defaultExpiresIn?: number | null; disableCustomExpiresTime?: boolean; minExpiresIn?: number; maxExpiresIn?: number; }

Customize the key expiration.

keyExpiration options
rateLimit { enabled?: boolean; timeWindow?: number; maxRequests?: number; }

Customize the rate-limiting.

rateLimit options
schema InferOptionSchema<ReturnType<typeof apiKeySchema>>

Custom schema for the API key plugin.

disableSessionForAPIKeys boolean

An API Key can represent a valid session, so we automatically mock a session for the user if we find a valid API key in the request headers.

permissions { defaultPermissions?: Statements | ((userId: string, ctx: GenericEndpointContext) => Statements | Promise<Statements>) }

Permissions for the API key.

Read more about permissions here.

permissions Options
disableKeyHashing boolean

Disable hashing of the API key.

⚠️ Security Warning: It's strongly recommended to not disable hashing. Storing API keys in plaintext makes them vulnerable to database breaches, potentially exposing all your users' API keys.

Schema
Table: apiKey

Field Name Type Key Description
id string PK The ID of the API key.
name string ? The name of the API key.
start string ? The starting characters of the API key. Useful for showing the first few characters of the API key in the UI for the users to easily identify.
prefix string ? The API Key prefix. Stored as plain text.
key string - The hashed API key itself.
userId string FK The ID of the user who created the API key.
refillInterval number ? The interval to refill the key in milliseconds.
refillAmount number ? The amount to refill the remaining count of the key.
lastRefillAt Date ? The date and time when the key was last refilled.
enabled boolean - Whether the API key is enabled.
rateLimitEnabled boolean - Whether the API key has rate limiting enabled.
rateLimitTimeWindow number ? The time window in milliseconds for the rate limit.
rateLimitMax number ? The maximum number of requests allowed within the `rateLimitTimeWindow`.
requestCount number - The number of requests made within the rate limit time window.
remaining number ? The number of requests remaining.
lastRequest Date ? The date and time of the last request made to the key.
expiresAt Date ? The date and time when the key will expire.
createdAt Date - The date and time the API key was created.
updatedAt Date - The date and time the API key was updated.
permissions string ? The permissions of the key.
metadata Object ? Any additional metadata you want to store with the key.
Permissions
API keys can have permissions associated with them, allowing you to control access at a granular level. Permissions are structured as a record of resource types to arrays of allowed actions.

Setting Default Permissions
You can configure default permissions that will be applied to all newly created API keys:

export const auth = betterAuth({
plugins: [
apiKey({
permissions: {
defaultPermissions: {
files: ["read"],
users: ["read"],
},
},
}),
],
});
You can also provide a function that returns permissions dynamically:

export const auth = betterAuth({
plugins: [
apiKey({
permissions: {
defaultPermissions: async (userId, ctx) => {
// Fetch user role or other data to determine permissions
return {
files: ["read"],
users: ["read"],
};
},
},
}),
],
});
Creating API Keys with Permissions
When creating an API key, you can specify custom permissions:

const apiKey = await auth.api.createApiKey({
body: {
name: "My API Key",
permissions: {
files: ["read", "write"],
users: ["read"],
},
userId: "userId",
},
});
Verifying API Keys with Required Permissions
When verifying an API key, you can check if it has the required permissions:

const result = await auth.api.verifyApiKey({
body: {
key: "your_api_key_here",
permissions: {
files: ["read"],
},
},
});

if (result.valid) {
// API key is valid and has the required permissions
} else {
// API key is invalid or doesn't have the required permissions
}
Updating API Key Permissions
You can update the permissions of an existing API key:

const apiKey = await auth.api.updateApiKey({
body: {
keyId: existingApiKeyId,
permissions: {
files: ["read", "write", "delete"],
users: ["read", "write"],
},
},
headers: user_headers,
});
Permissions Structure
Permissions follow a resource-based structure:

type Permissions = {
[resourceType: string]: string[];
};

// Example:
const permissions = {
files: ["read", "write", "delete"],
users: ["read"],
projects: ["read", "write"],
};
When verifying an API key, all required permissions must be present in the API key's permissions for validation to succeed.
API Key
The API Key plugin allows you to create and manage API keys for your application. It provides a way to authenticate and authorize API requests by verifying API keys.

Features
Create, manage, and verify API keys
Built-in rate limiting
Custom expiration times, remaining count, and refill systems
metadata for API keys
Custom prefix
Sessions from API keys
Installation
Add Plugin to the server
auth.ts

import { betterAuth } from "better-auth"
import { apiKey } from "better-auth/plugins"

export const auth = betterAuth({
plugins: [
apiKey()
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
import { apiKeyClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
plugins: [
apiKeyClient()
]
})
Usage
You can view the list of API Key plugin options here.

Create an API key
/api-key/create
Client
Server

const { data: apiKey, error } = await authClient.apiKey.create({
name: "My API Key",
expiresIn: 60 _ 60 _ 24 \* 7, // 7 days
prefix: "my_app",
metadata: {
tier: "premium",
},
});
All API keys are assigned to a user. If you're creating an API key on the server, without access to headers, you must pass the userId property. This is the ID of the user that the API key is associated with.

Properties
All properties are optional. However if you pass a refillAmount, you must also pass a refillInterval, and vice versa.

name?: The name of the API key.
expiresIn?: The expiration time of the API key in seconds. If not provided, the API key will never expire.
prefix?: The prefix of the API key. This is used to identify the API key in the database.
metadata?: The metadata of the API key. This is used to store additional information about the API key.
Server Only Properties
remaining?: The remaining number of requests for the API key. If null, then there is no cap to key usage.
refillAmount?: The amount to refill the remaining count of the API key.
refillInterval?: The interval to refill the API key in milliseconds.
rateLimitTimeWindow?: The duration in milliseconds where each request is counted. Once the rateLimitMax is reached, the request will be rejected until the timeWindow has passed, at which point the time window will be reset.
rateLimitMax?: The maximum number of requests allowed within the rateLimitTimeWindow.
rateLimitEnabled?: Whether rate limiting is enabled for the API key.
permissions?: Permissions for the API key, structured as a record mapping resource types to arrays of allowed actions.

const example = {
projects: ["read", "read-write"],
};
userId?: The ID of the user associated with the API key. When creating an API Key, you must pass the headers of the user who will own the key. However if you do not have the headers, you can pass this field, which will allow you to bypass the need for headers.
Result
It'll return the ApiKey object which includes the key value for you to use. Otherwise if it throws, it will throw an APIError.

Verify an API key
/api-key/verify

const { valid, error, key } = await auth.api.verifyApiKey({
body: {
key: "your_api_key_here",
},
});

//with permissions check
const { valid, error, key } = await auth.api.verifyApiKey({
body: {
key: "your_api_key_here",
permissions: {
projects: ["read", "read-write"],
},
},
});
Properties
key: The API Key to validate
permissions?: The permissions to check against the API key.
Result

type Result = {
valid: boolean;
error: { message: string; code: string } | null;
key: Omit<ApiKey, "key"> | null;
};
Get an API key
/api-key/get

const key = await auth.api.getApiKey({
body: {
keyId: "your_api_key_id_here",
},
});
Properties
keyId: The API key ID to get information on.
Result
You'll receive everything about the API key details, except for the key value itself. If it fails, it will throw an APIError.

type Result = Omit<ApiKey, "key">;
Update an API key
/api-key/update
Client
Server

const { data: apiKey, error } = await authClient.apiKey.update({
keyId: "your_api_key_id_here",
name: "New API Key Name",
enabled: false,
});
Properties
Client

- keyId: The API key ID to update on. - name?: Update the key name.

Server Only

- userId?: Update the user ID who owns this key. - name?: Update the key name. - enabled?: Update whether the API key is enabled or not. - remaining?: Update the remaining count. - refillAmount?: Update the amount to refill the remaining count every interval. - refillInterval?: Update the interval to refill the remaining count. - metadata?: Update the metadata of the API key. - expiresIn?: Update the expiration time of the API key. In seconds. - rateLimitEnabled?: Update whether the rate-limiter is enabled or not. - rateLimitTimeWindow?: Update the time window for the rate-limiter. - rateLimitMax?: Update the maximum number of requests they can make during the rate-limit-time-window.

Result
If fails, throws APIError. Otherwise, you'll receive the API Key details, except for the key value itself.

Delete an API Key
/api-key/delete
Client
Server

const { data: result, error } = await authClient.apiKey.delete({
keyId: "your_api_key_id_here",
});
Properties
keyId: The API key ID to delete.
Result
If fails, throws APIError. Otherwise, you'll receive:

type Result = {
success: boolean;
};
List API keys
/api-key/list
Client
Server

const { data: apiKeys, error } = await authClient.apiKey.list();
Result
If fails, throws APIError. Otherwise, you'll receive:

type Result = ApiKey[];
Delete all expired API keys
This function will delete all API keys that have an expired expiration date.

/api-key/delete-all-expired-api-keys
ts await auth.api.deleteAllExpiredApiKeys();

We automatically delete expired API keys every time any apiKey plugin endpoints were called, however they are rate-limited to a 10 second cool down each call to prevent multiple calls to the database.

Sessions from API keys
Any time an endpoint in Better Auth is called that has a valid API key in the headers, we will automatically create a mock session to represent the user.

The default header key is x-api-key, but this can be changed by setting the apiKeyHeaders option in the plugin options.

export const auth = betterAuth({
plugins: [
apiKey({
apiKeyHeaders: ["x-api-key", "xyz-api-key"], // or you can pass just a string, eg: "x-api-key"
}),
],
});
Or optionally, you can pass an apiKeyGetter function to the plugin options, which will be called with the GenericEndpointContext, and from there, you should return the API key, or null if the request is invalid.

export const auth = betterAuth({
plugins: [
apiKey({
apiKeyGetter: (ctx) => {
const has = ctx.request.headers.has("x-api-key");
if (!has) return null;
return ctx.request.headers.get("x-api-key");
},
}),
],
});
Rate Limiting
Every API key can have its own rate limit settings, however, the built-in rate-limiting only applies to the verification process for a given API key. For every other endpoint/method, you should utilize Better Auth's built-in rate-limiting.

You can refer to the rate-limit default configurations below in the API Key plugin options.

An example default value:

export const auth = betterAuth({
plugins: [
apiKey({
rateLimit: {
enabled: true,
timeWindow: 1000 * 60 * 60 * 24, // 1 day
maxRequests: 10, // 10 requests per day
},
}),
],
});
For each API key, you can customize the rate-limit options on create.

You can only customize the rate-limit options on the server auth instance.

const apiKey = await auth.api.createApiKey({
body: {
rateLimitEnabled: true,
rateLimitTimeWindow: 1000 _ 60 _ 60 \* 24, // 1 day
rateLimitMax: 10, // 10 requests per day
},
headers: user_headers,
});
How does it work?
For each request, a counter (internally called requestCount) is incremented.
If the rateLimitMax is reached, the request will be rejected until the timeWindow has passed, at which point the timeWindow will be reset.

Remaining, refill, and expiration
The remaining count is the number of requests left before the API key is disabled.
The refill interval is the interval in milliseconds where the remaining count is refilled by day.
The expiration time is the expiration date of the API key.

How does it work?
Remaining:
Whenever an API key is used, the remaining count is updated.
If the remaining count is null, then there is no cap to key usage.
Otherwise, the remaining count is decremented by 1.
If the remaining count is 0, then the API key is disabled & removed.

refillInterval & refillAmount:
Whenever an API key is created, the refillInterval and refillAmount are set to null.
This means that the API key will not be refilled automatically.
However, if refillInterval & refillAmount are set, then the API key will be refilled accordingly.

Expiration:
Whenever an API key is created, the expiresAt is set to null.
This means that the API key will never expire.
However, if the expiresIn is set, then the API key will expire after the expiresIn time.

Custom Key generation & verification
You can customize the key generation and verification process straight from the plugin options.

Here's an example:

export const auth = betterAuth({
plugins: [
apiKey({
customKeyGenerator: (options: {
length: number;
prefix: string | undefined;
}) => {
const apiKey = mySuperSecretApiKeyGenerator(
options.length,
options.prefix
);
return apiKey;
},
customAPIKeyValidator: ({ ctx, key }) => {
if (key.endsWith("_super_secret_api_key")) {
return true;
} else {
return false;
}
},
}),
],
});
If you're not using the length property provided by customKeyGenerator, you must set the defaultKeyLength property to how long generated keys will be.

export const auth = betterAuth({
plugins: [
apiKey({
customKeyGenerator: () => {
return crypto.randomUUID();
},
defaultKeyLength: 36 // Or whatever the length is
})
]
});
If an API key is validated from your customAPIKeyValidator, we still must match that against the database's key. However, by providing this custom function, you can improve the performance of the API key verification process, as all failed keys can be invalidated without having to query your database.

Metadata
We allow you to store metadata alongside your API keys. This is useful for storing information about the key, such as a subscription plan for example.

To store metadata, make sure you haven't disabled the metadata feature in the plugin options.

export const auth = betterAuth({
plugins: [
apiKey({
enableMetadata: true,
}),
],
});
Then, you can store metadata in the metadata field of the API key object.

const apiKey = await auth.api.createApiKey({
body: {
metadata: {
plan: "premium",
},
},
});
You can then retrieve the metadata from the API key object.

const apiKey = await auth.api.getApiKey({
body: {
keyId: "your_api_key_id_here",
},
});

console.log(apiKey.metadata.plan); // "premium"
API Key plugin options
apiKeyHeaders string | string[];

The header name to check for API key. Default is x-api-key.

customAPIKeyGetter (ctx: GenericEndpointContext) => string | null

A custom function to get the API key from the context.

customAPIKeyValidator (options: { ctx: GenericEndpointContext; key: string; }) => boolean

A custom function to validate the API key.

customKeyGenerator (options: { length: number; prefix: string | undefined; }) => string | Promise<string>

A custom function to generate the API key.

startingCharactersConfig { shouldStore?: boolean; charactersLength?: number; }

Customize the starting characters configuration.

startingCharactersConfig Options
defaultKeyLength number

The length of the API key. Longer is better. Default is 64. (Doesn't include the prefix length)

defaultPrefix string

The prefix of the API key.

Note: We recommend you append an underscore to the prefix to make the prefix more identifiable. (eg hello\_)

maximumPrefixLength number

The maximum length of the prefix.

minimumPrefixLength number

The minimum length of the prefix.

maximumNameLength number

The maximum length of the name.

minimumNameLength number

The minimum length of the name.

enableMetadata boolean

Whether to enable metadata for an API key.

keyExpiration { defaultExpiresIn?: number | null; disableCustomExpiresTime?: boolean; minExpiresIn?: number; maxExpiresIn?: number; }

Customize the key expiration.

keyExpiration options
rateLimit { enabled?: boolean; timeWindow?: number; maxRequests?: number; }

Customize the rate-limiting.

rateLimit options
schema InferOptionSchema<ReturnType<typeof apiKeySchema>>

Custom schema for the API key plugin.

disableSessionForAPIKeys boolean

An API Key can represent a valid session, so we automatically mock a session for the user if we find a valid API key in the request headers.

permissions { defaultPermissions?: Statements | ((userId: string, ctx: GenericEndpointContext) => Statements | Promise<Statements>) }

Permissions for the API key.

Read more about permissions here.

permissions Options
disableKeyHashing boolean

Disable hashing of the API key.

⚠️ Security Warning: It's strongly recommended to not disable hashing. Storing API keys in plaintext makes them vulnerable to database breaches, potentially exposing all your users' API keys.

Schema
Table: apiKey

Field Name Type Key Description
id string PK The ID of the API key.
name string ? The name of the API key.
start string ? The starting characters of the API key. Useful for showing the first few characters of the API key in the UI for the users to easily identify.
prefix string ? The API Key prefix. Stored as plain text.
key string - The hashed API key itself.
userId string FK The ID of the user who created the API key.
refillInterval number ? The interval to refill the key in milliseconds.
refillAmount number ? The amount to refill the remaining count of the key.
lastRefillAt Date ? The date and time when the key was last refilled.
enabled boolean - Whether the API key is enabled.
rateLimitEnabled boolean - Whether the API key has rate limiting enabled.
rateLimitTimeWindow number ? The time window in milliseconds for the rate limit.
rateLimitMax number ? The maximum number of requests allowed within the `rateLimitTimeWindow`.
requestCount number - The number of requests made within the rate limit time window.
remaining number ? The number of requests remaining.
lastRequest Date ? The date and time of the last request made to the key.
expiresAt Date ? The date and time when the key will expire.
createdAt Date - The date and time the API key was created.
updatedAt Date - The date and time the API key was updated.
permissions string ? The permissions of the key.
metadata Object ? Any additional metadata you want to store with the key.
Permissions
API keys can have permissions associated with them, allowing you to control access at a granular level. Permissions are structured as a record of resource types to arrays of allowed actions.

Setting Default Permissions
You can configure default permissions that will be applied to all newly created API keys:

export const auth = betterAuth({
plugins: [
apiKey({
permissions: {
defaultPermissions: {
files: ["read"],
users: ["read"],
},
},
}),
],
});
You can also provide a function that returns permissions dynamically:

export const auth = betterAuth({
plugins: [
apiKey({
permissions: {
defaultPermissions: async (userId, ctx) => {
// Fetch user role or other data to determine permissions
return {
files: ["read"],
users: ["read"],
};
},
},
}),
],
});
Creating API Keys with Permissions
When creating an API key, you can specify custom permissions:

const apiKey = await auth.api.createApiKey({
body: {
name: "My API Key",
permissions: {
files: ["read", "write"],
users: ["read"],
},
userId: "userId",
},
});
Verifying API Keys with Required Permissions
When verifying an API key, you can check if it has the required permissions:

const result = await auth.api.verifyApiKey({
body: {
key: "your_api_key_here",
permissions: {
files: ["read"],
},
},
});

if (result.valid) {
// API key is valid and has the required permissions
} else {
// API key is invalid or doesn't have the required permissions
}
Updating API Key Permissions
You can update the permissions of an existing API key:

const apiKey = await auth.api.updateApiKey({
body: {
keyId: existingApiKeyId,
permissions: {
files: ["read", "write", "delete"],
users: ["read", "write"],
},
},
headers: user_headers,
});
Permissions Structure
Permissions follow a resource-based structure:

type Permissions = {
[resourceType: string]: string[];
};

// Example:
const permissions = {
files: ["read", "write", "delete"],
users: ["read"],
projects: ["read", "write"],
};
When verifying an API key, all required permissions must be present in the API key's permissions for validation to succeed.
