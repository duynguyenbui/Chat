import { auth, unstable_update } from '@/auth';
import { TokenResponse } from '@/types';
import axios from 'axios';

const axiosInterceptorInstance = axios.create({
  baseURL: process.env.API_SERVER_URL!, // Replace with your API base URL
});

// Request interceptor
axiosInterceptorInstance.interceptors.request.use(
  async (config) => {
    // Modify the request config here (add headers, authentication tokens)
    const session = await auth();

    const accessToken = session?.user?.access_token;
    const issuedAt = session?.user.issued_at.toString();
    const expiresIn = session?.user.expires_in;

    const currentTime = new Date().getTime(); // Get the current time in milliseconds

    if (accessToken && issuedAt && expiresIn) {
      const expirationTime = new Date(issuedAt).getTime() + expiresIn * 1000; // Calculate the expiration time in milliseconds

      if (currentTime <= expirationTime) {
        if (config.headers)
          config.headers.Authorization = 'Bearer ' + accessToken;
      }
    }
    // TODO: Implement refresh token here
    return config;
  },
  (error) => {
    // Handle request errors here
    return Promise.reject(error);
  }
);

// TODO: Implement refresh token here not working
axiosInterceptorInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const { response } = error;
    const status = response?.status;

    if (status === 401 || status === 403) {
      const session = await auth();
      if (session?.user) {
        const issuedAt = session?.user.issued_at.toString();
        const expiresIn = session?.user.expires_in;
        const refreshToken = session?.user.refresh_token;

        const currentTime = new Date().getTime();

        const expirationTime = new Date(issuedAt!).getTime() + expiresIn * 1000; // Calculate the expiration time in milliseconds

        if (currentTime >= expirationTime) {
          const data = { refreshToken: refreshToken };

          const token: TokenResponse = await fetch(
            `${process.env.API_SERVER_URL!}/api/v1/identity/refresh`,
            {
              method: 'POST',
              body: JSON.stringify(data),
            }
          ).then((res) => res.json());
          // Update session
          session.user.access_token = token.accessToken;
          session.user.refresh_token = token.refreshToken;
          session.user.issued_at = new Date().toString();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInterceptorInstance;
