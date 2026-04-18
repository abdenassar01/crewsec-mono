import { expo } from '@better-auth/expo';
import {
  type AuthFunctions,
  createClient,
  type GenericCtx,
} from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth';

import { components, internal } from './_generated/api';
import { type DataModel } from './_generated/dataModel';
import { query } from './_generated/server';

const siteUrl = process.env.SITE_URL!;

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  verbose: true,
  triggers: {
    user: {
      async onCreate(ctx, doc) {
        console.log('Registered new user: ', doc.email);
      },
    },
  },
});

function getRootDomain(url: string) {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return '.' + parts.slice(-2).join('.');
    }
    return hostname;
  } catch {
    return undefined;
  }
}

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false },
) => {
  return betterAuth({
    logger: {
      disabled: optionsOnly,
      log(level, message, ...args) {
        console.log(
          `[DEBUG (AUTH) | ${level} |] message: ${message}, args:`,
          ...args,
        );
      },
    },
    cors: {
      origin: [
        siteUrl,
        'crewsec://',
        'crewsec-prod://',
        'crewsec-staging://',
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:19006',
        'http://127.0.0.1:8081',
        'http://127.0.0.1:8082',
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:19006',
      ],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: 'None',
        secure: true,
        domain: getRootDomain(siteUrl),
      },
    },
    trustedOrigins: [
      siteUrl,
      'crewsec://',
      'crewsec-prod://',
      'crewsec-staging://',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:19006',
      'http://127.0.0.1:8081',
      'http://127.0.0.1:8082',
      'http://127.0.0.1:19006',
      'http://localhost:3000',
      'crewsec://*',
      ...(process.env.NODE_ENV === 'development'
        ? ['exp://', 'exp://**', 'exp://192.168.*.*:*/**']
        : []),
    ],
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    user: {
      additionalFields: {},
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      expo(),
      convex(),

      // crossDomain({ siteUrl })
    ],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});

export const { onCreate } = authComponent.triggersApi();
