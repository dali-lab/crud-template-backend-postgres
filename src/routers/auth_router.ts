import bodyParser from 'body-parser';
import express from 'express';
import { createValidator } from 'express-joi-validation';
import requireScope from 'auth/requireScope';
import requireSelf from 'auth/requireSelf';
import requireLogout from 'auth/requireLogout';
import { UserScopes } from 'db/models/user'; 
import { requireAuth, requireSignin } from 'auth';
import { authController } from 'controllers';
import { SignUpUserSchema, ResendCodeSchema, VerifyUserSchema } from 'validation/auth';
import { validationErrorHandler } from 'validation';
import { errorHandler } from 'errors';

const router = express();
const validator = createValidator({ passError: true });

// TODO: Move middleware attachment to test file
if (process.env.NODE_ENV === 'test') {
  // enable json message body for posting data to router
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());
}

router.route('/signup')
  .post(
    validator.body(SignUpUserSchema),
    authController.signUpUser,
  );

// Send user object and server will send back authToken and user object
router.route('/signin')
  .post(
    requireSignin, 
    authController.signInUser,
  );

router.route('/jwt-signin')
  .get(
    requireAuth, 
    authController.jwtSignIn,
  );

router.route('/logout')
  .post(
    requireLogout, 
    (req, res) => {
      res.sendStatus(200);
    },
  );

router.route('/resend-code/:id')
  .post(
    requireScope(UserScopes.Unverified),
    requireSelf(UserScopes.Admin),
    validator.body(ResendCodeSchema),
    authController.resendCode,
  );

router.route('/verify/:id')
  .patch(
    requireScope(UserScopes.Unverified),
    requireSelf(UserScopes.Admin),
    validator.body(VerifyUserSchema),
    authController.verifyUser,
  );

if (process.env.NODE_ENV === 'test') {
  router.use(validationErrorHandler);
  router.use(errorHandler);
}

export default router;
