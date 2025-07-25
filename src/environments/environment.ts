export const environment = {
  production: true,
  apiUrls: {
    auth: 'https://api.revlohapp.com/auth/api/v1',
    users: 'https://api.revlohapp.com/auth/api/v1',
    security: 'https://api.revlohapp.com/auth/api/v1',
  },
  jwt: {
    tokenKey: 'revloh_access_token',
    refreshTokenKey: 'revloh_refresh_token',
    tokenExpirationKey: 'revloh_token_expiration'
  },
  app: {
    name: 'RevlohApp',
    version: '1.0.0',
    defaultLanguage: 'en',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm'
  }
};