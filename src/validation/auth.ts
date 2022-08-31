import joi from 'joi';
import { ValidatedRequestSchema, ContainerTypes } from 'express-joi-validation';
import { UserDoc } from 'types/models';

export const SignUpUserSchema = joi.object<UserDoc>({
  email: joi.string().email().required(),
  password: joi.string().required(),
  first_name: joi.string().required(),
  last_name: joi.string().required(),
});

export interface SignUpUserRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: UserDoc
}
