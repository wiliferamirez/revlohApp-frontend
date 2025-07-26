export const environment = {
  production: false,
  apiUrls: {
    auth: 'http://localhost:5224/api/v1',  
    users: 'http://localhost:5224/api/v1', 
    security: 'http://localhost:5224/api/v1', 
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