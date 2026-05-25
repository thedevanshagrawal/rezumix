import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";;
import bcrypt from "bcryptjs";
import userModel from "@/models/userModel";
import { connectDB } from "@/db/connectDB";
import { isValidEmail } from "@/lib/validation";

export const authOptions = {
  secret: process.env.JWT_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials;

          // Prevent NoSQL injection
          if (typeof email !== "string" || typeof password !== "string") {
            throw new Error("Invalid input types");
          }

          const sanitizedEmail = email.trim().toLowerCase();

          await connectDB();

          // Validate email format
          if (!isValidEmail(sanitizedEmail)) {
            throw new Error("Invalid email format");
          }

          const user = await userModel.findOne({ email: sanitizedEmail });
          if (!user) {
            throw new Error("User not found");
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
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
            accessToken: user.accessToken || "",
            role: user.role
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
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.fullName = user.name;
        token.email = user.email;
        token.accessToken = user.accessToken || '';
        token.role = user.role
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.fullName = token.fullName;
        session.user.email = token.email;
        session.user.role = token.role
      }

      const headers = new Headers();
      headers.set("Authorization", `Bearer ${token.accessToken}`);

      session.headers = headers;

      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }