import { betterAuth } from "better-auth";
import { getOAuthState } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { assertProductionHttpsUrl } from "@/lib/server-api-config";

const uri = process.env.MONGODB_URI;
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const betterAuthUrl = process.env.BETTER_AUTH_URL;

assertProductionHttpsUrl("BETTER_AUTH_URL", betterAuthUrl);

if (!uri || !username || !password) {
  throw new Error("MONGODB_URI, MONGODB_USERNAME, and MONGODB_PASSWORD must be configured.");
}

const globalForMongo = globalThis as typeof globalThis & {
  homeFixMongoClient?: MongoClient;
};
const client =
  globalForMongo.homeFixMongoClient ??
  new MongoClient(uri, {
    auth: { username, password },
  });
globalForMongo.homeFixMongoClient = client;
export const db = client.db("HomeFix_DB");
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
type RegistrationRole = "customer" | "technician";

function isRegistrationRole(role: unknown): role is RegistrationRole {
  return role === "customer" || role === "technician";
}

if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
  throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together.");
}

export const auth = betterAuth({
  baseURL: betterAuthUrl,
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {},
    emailAndPassword: { 
    enabled: true, 
  }, 
     user: {
       additionalFields: {
          role: {
              type: ["customer", "technician", "admin"],
              input: true,
              defaultValue: "customer",
            },
          phone: {
            type: "string",
            required: false,
            input: true,
          },
          area: {
            type: "string",
            required: false,
            input: true,
          },
          bio: {
            type: "string",
            required: false,
            input: true,
          },
        }
    },
  databaseHooks: {
    user: {
      create: {
        async before(user) {
          const oauthState = await getOAuthState<{ role?: unknown }>();
          if (oauthState?.role !== undefined) {
            if (!isRegistrationRole(oauthState.role)) return false;
            return { data: { ...user, role: oauthState.role } };
          }

          if (user.role === undefined) {
            return { data: { ...user, role: "customer" } };
          }
          if (!isRegistrationRole(user.role)) return false;
        },
      },
      update: {
        async before(user) {
          if ("role" in user) return false
        },
      },
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
});