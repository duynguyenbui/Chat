import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { credential } from './actions/credentials';

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const user = await credential(credentials!);

        if (!user) return null;

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
