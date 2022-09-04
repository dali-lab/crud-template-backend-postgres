import bodyParser from 'body-parser';
import express from 'express';
import { createValidator } from 'express-joi-validation';
import requireScope from 'auth/requireScope';
import { UserScopes } from 'db/models/user'; 
import { resourceController } from 'controllers';
import { errorHandler } from 'errors';
import { validationErrorHandler } from 'validation';
import { CreateResourceSchema, UpdateResourceSchema } from 'validation/resource';

const router = express();
const validator = createValidator({ passError: true });

// TODO: Move middleware attachment to test file
if (process.env.NODE_ENV === 'test') {
  // enable json message body for posting data to router
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());
}

// find and return all resources
router.route('/')
  .get(
    requireScope(UserScopes.Admin),
    resourceController.getAllResources,
  )
  .post(
    requireScope(UserScopes.User),
    validator.body(CreateResourceSchema),
    resourceController.createResource,
  );

router.route('/:id')
  .get(
    resourceController.getResource,
  )
  .patch(
    requireScope(UserScopes.User),
    validator.body(UpdateResourceSchema),
    resourceController.updateResource,
  )
  .delete(
    requireScope(UserScopes.User),
    resourceController.deleteResource,
  );

if (process.env.NODE_ENV === 'test') {
  router.use(validationErrorHandler);
  router.use(errorHandler);
}

export default router;
