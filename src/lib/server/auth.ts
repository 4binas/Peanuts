import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { genericOAuth } from 'better-auth/plugins';
import { PUBLIC_OIDC_PROVIDER_ID } from '$env/static/public';

const providerId = PUBLIC_OIDC_PROVIDER_ID;
const clientId = env.OIDC_CLIENT_ID;
const clientSecret = env.OIDC_CLIENT_SECRET;
const discoveryUrl = env.OIDC_DISCOVERY_URL;

if (!providerId || !clientId || !clientSecret || !discoveryUrl) {
	throw new Error('OIDC configuration is missing');
}

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	plugins: [
		sveltekitCookies(getRequestEvent), // make sure this is the last plugin in the array
		genericOAuth({
			config: [
				{
					providerId: providerId,
					clientId: clientId,
					clientSecret: clientSecret,
					discoveryUrl: discoveryUrl,
					// ... other config options
					scopes: ['openid', 'profile', 'email']
				}
				// Add more providers as needed
			]
		})
	]
});
