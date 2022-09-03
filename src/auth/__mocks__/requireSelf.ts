import { RequestHandler } from 'express';
/* import { isSubScope, ScopeNames } from 'authentication/scopes';
import { IUser } from '../../db/models/user';

const mockUser: Omit<IUser, 'id' | 'role'> = {
  email: 'test@test.com',
  password: 'password',
  name: 'Joe Smith',
};

// ? How can this be mocked to test against cross-user editing?
// const requireSelf = (adminScope: ScopeNames): RequestHandler => (req, res, next) => {
//   // Reject with 403 if url param different than test user and not admin user
//   if (req.params?.id !== mockUser.id && !isSubScope(mockUser.scope, adminScope)) return res.status(403).json({ message: 'Unauthorized' });

//   return next();
// };
*/

const requireSelf = (): RequestHandler => (req, res, next) => {
  return next();
};

export default requireSelf;
