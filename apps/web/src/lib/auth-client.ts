import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

// The convexClient plugin will route auth requests through the Convex backend
// The CORS configuration in convex/auth.ts handles the cross-origin requests
export const authClient = createAuthClient({
  plugins: [convexClient()],
});