Username
The username plugin wraps the email and password authenticator and adds username support. This allows users to sign in and sign up with their username instead of their email.

Installation
Add Plugin to the server
auth.ts

import { betterAuth } from "better-auth"
import { username } from "better-auth/plugins"

export const auth = betterAuth({
plugins: [
username()
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
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
plugins: [
usernameClient()
]
})
Usage
Sign up with username
To sign up a user with username, you can use the existing signUp.email function provided by the client. The signUp function should take a new username property in the object.

auth-client.ts

const data = await authClient.signUp.email({
email: "email@domain.com",
name: "Test User",
password: "password1234",
username: "test"
})
Sign in with username
To sign in a user with username, you can use the signIn.username function provided by the client. The signIn function takes an object with the following properties:

username: The username of the user.
password: The password of the user.
auth-client.ts

const data = await authClient.signIn.username({
username: "test",
password: "password1234",
})
Update username
To update the username of a user, you can use the updateUser function provided by the client.

auth-client.ts

const data = await authClient.updateUser({
username: "new-username"
})
Schema
The plugin requires 2 fields to be added to the user table:

Field Name Type Key Description
username string - The username of the user
displayUsername string - Non normalized username of the user
Options
Min Username Length
The minimum length of the username. Default is 3.

auth.ts

import { betterAuth } from "better-auth"
import { username } from "better-auth/plugins"

const auth = betterAuth({
plugins: [
username({
minUsernameLength: 5
})
]
})
Max Username Length
The maximum length of the username. Default is 30.

auth.ts

import { betterAuth } from "better-auth"
import { username } from "better-auth/plugins"

const auth = betterAuth({
plugins: [
username({
maxUsernameLength: 100
})
]
})
Username Validator
A function that validates the username. The function should return false if the username is invalid. By default, the username should only contain alphanumeric characters, underscores, and dots.

auth.ts

import { betterAuth } from "better-auth"
import { username } from "better-auth/plugins"

const auth = betterAuth({
plugins: [
username({
usernameValidator: (username) => {
if (username === "admin") {
return false
}
}
})
]
})
