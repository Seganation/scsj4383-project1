MCP
OAuth MCP

The MCP plugin lets your app act as an OAuth provider for MCP clients. It handles authentication and makes it easy to issue and manage access tokens for MCP applications.

Installation
Add the Plugin
Add the MCP plugin to your auth configuration and specify the login page path.

auth.ts

import { betterAuth } from "better-auth";
import { mcp } from "better-auth/plugins";

export const auth = betterAuth({
plugins: [
mcp({
loginPage: "/sign-in" // path to your login page
})
]
});
This doesn't have a client plugin, so you don't need to make any changes to your authClient.

Generate Schema
Run the migration or generate the schema to add the necessary fields and tables to the database.

migrate
generate

npx @better-auth/cli migrate
The MCP plugin uses the same schema as the OIDC Provider plugin. See the OIDC Provider Schema section for details.

Usage
OAuth Discovery Metadata
Add a route to expose OAuth metadata for MCP clients:

.well-known/oauth-authorization-server/route.ts

import { oAuthDiscoveryMetadata } from "better-auth/plugins";
import { auth } from "../../../lib/auth";

export const GET = oAuthDiscoveryMetadata(auth);
MCP Session Handling
You can use the helper function withMcpAuth to get the session and handle unauthenticated calls automatically.

api/[transport]/route.ts

import { auth } from "@/lib/auth";
import { createMcpHandler } from "@vercel/mcp-adapter";
import { withMcpAuth } from "better-auth/plugins";
import { z } from "zod";

const handler = withMcpAuth(auth, (req, session) => {
// session contains the access token record with scopes and user ID
return createMcpHandler(
(server) => {
server.tool(
"echo",
"Echo a message",
{ message: z.string() },
async ({ message }) => {
return {
content: [{ type: "text", text: `Tool echo: ${message}` }],
};
},
);
},
{
capabilities: {
tools: {
echo: {
description: "Echo a message",
},
},
},
},
{
redisUrl: process.env.REDIS_URL,
basePath: "/api",
verboseLogs: true,
maxDuration: 60,
},
)(req);
});

export { handler as GET, handler as POST, handler as DELETE };
You can also use auth.api.getMcpSession to get the session using the access token sent from the MCP client:

api/[transport]/route.ts

import { auth } from "@/lib/auth";
import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";

const handler = async (req: Request) => {
// session contains the access token record with scopes and user ID
const session = await auth.api.getMcpSession({
headers: req.headers
})
if(!session){
//this is important and you must return 401
return new Response(null, {
status: 401
})
}
return createMcpHandler(
(server) => {
server.tool(
"echo",
"Echo a message",
{ message: z.string() },
async ({ message }) => {
return {
content: [{ type: "text", text: `Tool echo: ${message}` }],
};
},
);
},
{
capabilities: {
tools: {
echo: {
description: "Echo a message",
},
},
},
},
{
redisUrl: process.env.REDIS_URL,
basePath: "/api",
verboseLogs: true,
maxDuration: 60,
},
)(req);
}

export { handler as GET, handler as POST, handler as DELETE };
Configuration
The MCP plugin accepts the following configuration options:

Prop Type Default
loginPage

## string

oidcConfig?

## object

OIDC Configuration
The plugin supports additional OIDC configuration options through the oidcConfig parameter:

Prop Type Default
codeExpiresIn?

number
600
accessTokenExpiresIn?

number
3600
refreshTokenExpiresIn?

number
604800
defaultScope?

string
openid
scopes?

string[]
["openid", "profile", "email", "offline_access"]
Schema
The MCP plugin uses the same schema as the OIDC Provider plugin. See the OIDC Provider Schema section for details.
