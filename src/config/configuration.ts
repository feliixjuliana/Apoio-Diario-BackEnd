export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
    user: process.env.POSTGRES_USER || 'admin',
    pass: process.env.POSTGRES_PASSWORD || 'adminpassword',
    name: process.env.POSTGRES_DB || 'app_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },
  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  }
});