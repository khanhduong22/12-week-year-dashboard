import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    // Protected routes
    "/dashboard",
    "/config",
    "/log",
    "/history",
    "/widget",
    // Protect api routes except auth
    "/api/((?!auth).*)"
  ]
};
