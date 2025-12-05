import jwt from 'jsonwebtoken';
import { config } from '../../config/environment';

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, config.jwt_secret, { expiresIn: '1d' });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwt_secret);
};