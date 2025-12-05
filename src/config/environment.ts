import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 3000,
  
  jwt_secret: process.env.JWT_SECRET || 'default_secret_key',
  
  db_user: process.env.POSTGRES_USER || 'admin',
  db_pass: process.env.POSTGRES_PASSWORD || 'adminpassword',
  db_name: process.env.POSTGRES_DB || 'app_db',
  db_host: process.env.POSTGRES_HOST || 'localhost',
  db_port: Number(process.env.POSTGRES_PORT) || 5433,

  google_client_id: process.env.GOOGLE_CLIENT_ID || '',

  email_user: process.env.EMAIL_USER || '',
  email_pass: process.env.EMAIL_PASS || '',
};