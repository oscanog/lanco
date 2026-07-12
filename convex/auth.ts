import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export function validatePasswordRequirements(password: string) {
  const missing = [];
  if (password.length < 8) missing.push("8 characters");
  if (!/[a-zA-Z]/.test(password)) missing.push("one letter");
  if (!/\d/.test(password)) missing.push("one number");
  
  if (missing.length > 0) {
    throw new Error(`Password is too weak. It must contain at least: ${missing.join(", ")}.`);
  }
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ validatePasswordRequirements })],
});
