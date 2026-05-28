import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Standardized helper to sign JWT tokens.
 */
export function generateJwtToken(payload, secret, options = {}) {
  if (!secret) {
    throw new Error("JWT Secret is required for token signature");
  }
  return jwt.sign(payload, secret, {
    expiresIn: "7d",
    ...options
  });
}

/**
 * Standardized helper to verify JWT tokens.
 */
export function verifyJwtToken(token, secret) {
  if (!secret) {
    throw new Error("JWT Secret is required for token verification");
  }
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}
