import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { genericOAuth } from 'better-auth/plugins';

const providerId = publicEnv.PUBLIC_OIDC_PROVIDER_ID;
const clientId = env.OIDC_CLIENT_ID;
const clientSecret = env.OIDC_CLIENT_SECRET;
const discoveryUrl = env.OIDC_DISCOVERY_URL;

export const getAuth = () => {
	return betterAuth({
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
};
