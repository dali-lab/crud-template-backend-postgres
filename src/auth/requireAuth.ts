/* eslint-disable func-names */
import passport from 'passport';
import { Strategy as jwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import { userService } from 'services';
import { IUser } from 'db/models/user';

dotenv.config();

passport.use(
  'jwt',
  new jwtStrategy(
    {
      secretOrKey: (process.env.AUTH_SECRET ?? '').toString(),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        // use id encrypted in token to get user
        const userResult: IUser[] = await userService.getUsers({ id: token.user.id });
        if (userResult.length == 0) return done(new Error('Invalid token.'));

        return done(null, userResult[0]);
      } catch (e) {
        done(e);
      }
    },
  ),
);

// Create function to transmit result of authenticate() call to user or next middleware
const requireAuth: RequestHandler = (req, res, next) => {
  // eslint-disable-next-line prefer-arrow-callback
  passport.authenticate('jwt', { session: false }, function (err, user, info) {
    // Return any existing errors
    if (err) { return next(err); }

    // If no user found, return appropriate error message
    if (!user) { return res.status(401).json({ message: info?.message || 'Error authenticating email and password' }); }

    req.user = user;

    return next();
  })(req, res, next);
};

export default requireAuth;
