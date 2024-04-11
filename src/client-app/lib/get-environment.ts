export const getUrlEnvironment = () => {
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://api.chatapp.com';
};
