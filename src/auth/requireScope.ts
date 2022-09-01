import { RequestHandler } from 'express';
import passport from 'passport';
import { isSubScope, ScopeNames } from 'auth/scopes';
import { IUser } from 'db/models/user';

/**
 * Middleware that requires a minimum scope to access the protected route
 * @param scope minimum scope to require on protected route
 * @returns express middleware handler
 */
const requireScope = (scope: ScopeNames): RequestHandler => (req, res, next) => {
  passport.authenticate('jwt', { session: false }, function (err, user: IUser, info) {
    if (err) { return next(err); }
    if (!user) { return res.status(401).json({ message: info?.message || 'Error authenticating email and password' }); }
    if (!isSubScope(user.role, scope)) { return res.status(403).json({ message: 'Unauthorized' }); }

    req.user = user;
    return next();
  })(req, res, next);
};

export default requireScope;
