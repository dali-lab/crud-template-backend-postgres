import { RequestHandler } from 'express';
// import { ScopeNames } from 'authentication/scopes';
import { IUser } from '../../db/models/user';

const mockUser: Omit<IUser, 'id' | 'role'> = {
  email: 'test@test.com',
  password: 'password',
  name: 'Joe Smith',
};

const requireScope = (): RequestHandler => (req, res, next) => {
  // Reject with 403 if user scope is not sufficient
  if (!req.get('Authorization')) return res.status(403).json({ message: 'Unauthorized' });

  req.user = mockUser;
  return next();
};

export default requireScope;
