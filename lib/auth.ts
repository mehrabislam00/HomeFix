import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const uri = process.env.MONGODB_URI;
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error("MONGODB_URI, MONGODB_USERNAME, and MONGODB_PASSWORD must be configured.");
}

const client = new MongoClient(uri, {
  auth: { username, password },
});
const db = client.db("HomeFix_DB");
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
  throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together.");
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
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
              type: ["customer", "technician"],
              input: true,
              defaultValue: "customer",
            } 
        }
    },
  database: mongodbAdapter(db, {
    client,
  }),
});