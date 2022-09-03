import { RequestHandler } from 'express';
import { IUser } from '../../db/models/user';

const mockUser: Omit<IUser, 'id' | 'role'> = {
  email: 'test@test.com',
  password: 'password',
  name: 'Joe Smith',
};

const requireAuth: RequestHandler = (req, res, next) => {
  // Reject with 401 if no bearer token
  if (!req.get('Authorization')) return res.status(401).json({ message: 'Error authenticating email and password' });

  req.user = mockUser;
  return next();
};

export default requireAuth;
