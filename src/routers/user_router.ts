import bodyParser from 'body-parser';
import express from 'express';
import { createValidator } from 'express-joi-validation';

import requireScope from 'auth/requireScope';
import requireSelf from 'auth/requireSelf';
import { UserScopes } from 'db/models/user'; 
import { userController } from 'controllers';
import { errorHandler } from 'errors';
import { validationErrorHandler } from 'validation';
import { CreateUserSchema, UpdateUserSchema } from 'validation/users';

const router = express();
const validator = createValidator({ passError: true });

// TODO: Move middleware attachment to test file
if (process.env.NODE_ENV === 'test') {
  // enable json message body for posting data to router
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());
}

router.route('/')
  .post(
    requireScope(UserScopes.Admin),
    validator.body(CreateUserSchema),
    userController.createNewUser,
  );

router.route('/:id')
  .get(
    requireScope(UserScopes.User),
    requireSelf(UserScopes.Admin),
    userController.getUser,
  )
  .patch(
    requireScope(UserScopes.User),
    requireSelf(UserScopes.Admin),
    validator.body(UpdateUserSchema),
    userController.updateUser,
  )
  .delete(
    requireScope(UserScopes.User),
    requireSelf(UserScopes.Admin),
    userController.deleteUser,
  );

if (process.env.NODE_ENV === 'test') {
  router.use(validationErrorHandler);
  router.use(errorHandler);
}

export default router;
