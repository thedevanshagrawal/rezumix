import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import userModel from "@/models/userModel";
import { connectDB } from "@/db/connectDB";
import { isValidEmail } from "@/lib/validation";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          await connectDB();

          const { email, password } = credentials;

          // Prevent invalid inputs
          if (typeof email !== "string" || typeof password !== "string") {
            throw new Error("Invalid input types");
          }

          const sanitizedEmail = email.trim().toLowerCase();

          // Validate email
          if (!isValidEmail(sanitizedEmail)) {
            throw new Error("Invalid email format");
          }

          const user = await userModel.findOne({
            email: sanitizedEmail,
          });

          if (!user) {
            throw new Error("User not found");
          }

          const isValidPassword = await bcrypt.compare(
            password,
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          if (!user.isVerified) {
            throw new Error("User is not verified");
          }

          return {
            id: user._id.toString(),
            name: user.fullName,
            email: user.email,
            role: user.role,
            accessToken: user.accessToken || "",
          };
        } catch (error) {
          console.error("Error during login:", error.message);
          throw new Error(error.message || "Error during login");
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60,
    updateAge: 4 * 60 * 60,
  },

  callbacks: {
    // Runs before a sign-in completes. For Google we look the user up by
    // email and either create a new account or link Google to an existing
    // one. Returning false (or throwing) aborts the sign-in.
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      // Google must have verified the email before we trust it.
      if (profile && profile.email_verified === false) {
        return false;
      }

      try {
        await connectDB();

        const email = (user.email || "").trim().toLowerCase();

        if (!email) {
          return false;
        }

        const existingUser = await userModel.findOne({ email });

        if (!existingUser) {
          // New user → create a Google-based account. No password is set;
          // Google has already verified ownership of the email.
          await userModel.create({
            fullName: user.name || email.split("@")[0],
            email,
            provider: "google",
            googleId: profile?.sub || account.providerAccountId,
            isVerified: true,
            role: "user",
          });

          return true;
        }

        // Existing account (likely created with a password). Link Google to
        // it without touching the password so credentials login keeps working.
        let needsSave = false;

        if (!existingUser.googleId) {
          existingUser.googleId = profile?.sub || account.providerAccountId;
          needsSave = true;
        }

        if (!existingUser.isVerified) {
          // Google has verified the email, so trust it for this account too.
          existingUser.isVerified = true;
          needsSave = true;
        }

        if (needsSave) {
          await existingUser.save();
        }

        return true;
      } catch (error) {
        console.error("Error during Google sign-in:", error.message);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      // Google sign-in: the `user`/`profile` here is the Google profile, not
      // our DB record, so load the DB user to attach the Mongo _id and role.
      if (account?.provider === "google") {
        await connectDB();

        const dbUser = await userModel.findOne({
          email: (user?.email || token.email || "").trim().toLowerCase(),
        });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.fullName = dbUser.fullName;
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.accessToken = "";
        }

        return token;
      }

      // Credentials sign-in: `authorize` already returned our session shape.
      if (user) {
        token.id = user.id;
        token.fullName = user.name;
        token.email = user.email;
        token.role = user.role;
        token.accessToken = user.accessToken || "";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.fullName = token.fullName;
        session.user.email = token.email;
        session.user.role = token.role;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };