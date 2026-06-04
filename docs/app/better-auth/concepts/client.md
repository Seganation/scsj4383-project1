Client
Better Auth offers a client library compatible with popular frontend frameworks like React, Vue, Svelte, and more. This client library includes a set of functions for interacting with the Better Auth server. Each framework's client library is built on top of a core client library that is framework-agnostic, so that all methods and hooks are consistently available across all client libraries.

Installation
If you haven't already, install better-auth.

npm
pnpm
yarn
bun

pnpm add better-auth
Create Client Instance
Import createAuthClient from the package for your framework (e.g., "better-auth/react" for React). Call the function to create your client. Pass the base URL of your auth server. If the auth server is running on the same domain as your client, you can skip this step.

If you're using a different base path other than /api/auth, make sure to pass the whole URL, including the path. (e.g., http://localhost:3000/custom-path/auth)

react
vue
svelte
solid
vanilla
lib/auth-client.ts

import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
baseURL: "http://localhost:3000" // The base URL of your auth server
})
Usage
Once you've created your client instance, you can use the client to interact with the Better Auth server. The client provides a set of functions by default and they can be extended with plugins.

Example: Sign In

auth-client.ts

import { createAuthClient } from "better-auth/client"
const authClient = createAuthClient()

await authClient.signIn.email({
email: "test@user.com",
password: "password1234"
})
Hooks
On top of normal methods, the client provides hooks to easily access different reactive data. Every hook is available in the root object of the client and they all start with use.

Example: useSession

React
Vue
Svelte
Solid
user.tsx

//make sure you're using the react client
import { createAuthClient } from "better-auth/react"
const { useSession } = createAuthClient()

export function User() {
const {
data: session,
isPending, //loading state
error, //error object
refetch //refetch the session
} = useSession()
return (
//...
)
}
Fetch Options
The client uses a library called better fetch to make requests to the server.

Better fetch is a wrapper around the native fetch API that provides a more convenient way to make requests. It's created by the same team behind Better Auth and is designed to work seamlessly with it.

You can pass any default fetch options to the client by passing fetchOptions object to the createAuthClient.

auth-client.ts

import { createAuthClient } from "better-auth/client"

const authClient = createAuthClient({
fetchOptions: {
//any better-fetch options
},
})
You can also pass fetch options to most of the client functions. Either as the second argument or as a property in the object.

auth-client.ts

await authClient.signIn.email({
email: "email@email.com",
password: "password1234",
}, {
onSuccess(ctx) {
//
}
})

//or

await authClient.signIn.email({
email: "email@email.com",
password: "password1234",
fetchOptions: {
onSuccess(ctx) {
//
}
},
})
Handling Errors
Most of the client functions return a response object with the following properties:

data: The response data.
error: The error object if there was an error.
the error object contains the following properties:

message: The error message. (e.g., "Invalid email or password")
status: The HTTP status code.
statusText: The HTTP status text.
auth-client.ts

const { data, error } = await authClient.signIn.email({
email: "email@email.com",
password: "password1234"
})
if (error) {
//handle error
}
If the actions accepts a fetchOptions option, you can pass onError callback to handle errors.

auth-client.ts

await authClient.signIn.email({
email: "email@email.com",
password: "password1234",
}, {
onError(ctx) {
//handle error
}
})

//or
await authClient.signIn.email({
email: "email@email.com",
password: "password1234",
fetchOptions: {
onError(ctx) {
//handle error
}
}
})
Hooks like useSession also return an error object if there was an error fetching the session. On top of that, they also return a isPending property to indicate if the request is still pending.

auth-client.ts

const { data, error, isPending } = useSession()
if (error) {
//handle error
}
Error Codes
The client instance contains $ERROR_CODES object that contains all the error codes returned by the server. You can use this to handle error translations or custom error messages.

auth-client.ts

const authClient = createAuthClient();

type ErrorTypes = Partial<
Record<
keyof typeof authClient.$ERROR_CODES,
{
en: string;
es: string;
} >

> ;

const errorCodes = {
USER_ALREADY_EXISTS: {
en: "user already registered",
es: "usuario ya registrada",
},
} satisfies ErrorTypes;

const getErrorMessage = (code: string, lang: "en" | "es") => {
if (code in errorCodes) {
return errorCodes[code as keyof typeof errorCodes][lang];
}
return "";
};

const { error } = await authClient.signUp.email({
email: "user@email.com",
password: "password",
name: "User",
});
if(error?.code){
alert(getErrorMessage(error.code, "en"));
}
Plugins
You can extend the client with plugins to add more functionality. Plugins can add new functions to the client or modify existing ones.

Example: Magic Link Plugin

auth-client.ts

import { createAuthClient } from "better-auth/client"
import { magicLinkClient } from "better-auth/client/plugins"

const authClient = createAuthClient({
plugins: [
magicLinkClient()
]
})
once you've added the plugin, you can use the new functions provided by the plugin.

auth-client.ts

await authClient.signIn.magicLink({
email: "test@email.com"
})
