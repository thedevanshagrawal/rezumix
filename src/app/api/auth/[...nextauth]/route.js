import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
  ],

  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60,
    updateAge: 4 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
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