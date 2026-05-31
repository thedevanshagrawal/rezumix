"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

// Maps NextAuth OAuth error codes (returned as ?error=... on the sign-in page)
// to user-friendly messages for the Login/Register screens.
export function googleAuthErrorMessage(code) {
  switch (code) {
    case "OAuthAccountNotLinked":
      return "This email is already registered with a different sign-in method.";
    case "AccessDenied":
      return "Access denied. Make sure your Google email is verified and try again.";
    case "OAuthSignin":
    case "OAuthCallback":
    case "Callback":
      return "Could not connect to Google. Please try again.";
    case "Configuration":
      return "Google sign-in is not configured correctly. Please contact support.";
    default:
      return "Authentication failed, please try again.";
  }
}

// Official Google "G" mark.
function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

/**
 * "Continue with Google" button that triggers the NextAuth Google OAuth flow.
 * Shows a redirecting spinner and reports unexpected failures via `onError`.
 */
export default function GoogleSignInButton({
  label = "Continue with Google",
  callbackUrl = "/dashboard",
  onError,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // redirect: true (default) sends the user to Google and back. On
      // failure NextAuth returns to /login?error=<code> which the pages map
      // to a message via googleAuthErrorMessage.
      await signIn("google", { callbackUrl });
    } catch (err) {
      setLoading(false);
      onError?.("Authentication failed, please try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      aria-label={label}
      className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Redirecting to Google...</span>
        </>
      ) : (
        <>
          <GoogleIcon />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
