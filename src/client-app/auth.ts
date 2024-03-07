import NextAuth from 'next-auth';
import authConfig from './auth.config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user, account }) {
      return { ...token, ...user, ...account };
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session.user.access_token = token.accessToken as string;
      session.user.refresh_token = token.refreshToken as string;
      session.user.expires_in = token.expiresIn as number;
      session.user.issued_at = new Date().toString() as string;
      session.user.id = token.sub as string;
      return session;
    },
  },
  session: { strategy: 'jwt' },
  ...authConfig,
});
