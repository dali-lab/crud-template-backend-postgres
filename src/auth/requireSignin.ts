/* eslint-disable func-names */
import passport from 'passport';
import { Strategy as localStrategy, IStrategyOptions } from 'passport-local';
import { RequestHandler } from 'express';
import { userService } from 'services';
import { getFieldNotFoundError } from 'errors';

const options: IStrategyOptions = {
  usernameField: 'email',
  passwordField: 'password',
};

passport.use(
  'login',
  new localStrategy(options, async (email, password, done) => {
    try {
      //get user object
      const user = (await userService.getUsers({ email }))?.[0];
      if (user == null) throw new Error('No user with this email exists.');

      const passwordValid = await userService.isValidPassword(email, password);
      if (!passwordValid) return done(new Error('Wrong password'), false);

      // // check for verified
      // if (!user.verified) {
      //   // send email with verification code
      //   sendVerificationCode(email);

      //   return done(new Error("You must verify your email to gain access."));
      // }

      return done(null, user, { message: 'Logged in successfully' });
    } catch (e) {
      return done(e);
    }
  }),
);

// Create function to transmit result of authenticate() call to user or next middleware
const requireSignin: RequestHandler = (req, res, next) => {
  // Validation of parameters
  if (!req.body.email) {
    return res.status(400).json({ message: getFieldNotFoundError('email') });
  }

  if (!req.body.password) {
    return res.status(400).json({ message: getFieldNotFoundError('password') });
  }

  // eslint-disable-next-line prefer-arrow-callback
  return passport.authenticate('local', { session: false }, function (err, user, info) {
    // Return any existing errors
    if (err) { return next(err); }

    // If no user found, return appropriate error message
    if (!user) { return res.status(401).json({ message: info.message || 'Error authenticating email and password' }); }

    req.user = user;

    return next();
  })(req, res, next);
};

export default requireSignin;
