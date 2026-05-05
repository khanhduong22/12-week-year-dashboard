import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // If sign in, call our NestJS API to get the backend JWT
      if (account && profile && profile.email) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              image: (profile as any).picture,
            }),
          });
          const data = await res.json();
          if (res.ok && data.access_token) {
            token.accessToken = data.access_token;
            token.id = data.user.id;
          }
        } catch (error) {
          console.error('Failed to auth with backend:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).accessToken = token.accessToken;
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Optional custom login page
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
