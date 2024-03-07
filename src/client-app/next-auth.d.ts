import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      email: string;
      image: string;
      name: string;
      issued_at: string;
      access_token: string;
      refresh_token: string;
      expires_in: number;
      id: string;
    };
  }
}
