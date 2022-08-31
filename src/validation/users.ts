import joi from 'joi';
import { ValidatedRequestSchema, ContainerTypes } from 'express-joi-validation';
import { UserFields } from 'types/models';

export const CreateUserSchema = joi.object<UserFields>({
  email: joi.string().email().required(),
  password: joi.string().required(),
  first_name: joi.string().required(),
  last_name: joi.string().required(),
});

export interface CreateUserRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: UserFields
}

export const UpdateUserSchema = joi.object<UserFields>({
  email: joi.string().email(),
  password: joi.string(),
  first_name: joi.string(),
  last_name: joi.string(),
});

export interface UpdateUserRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: Partial<UserFields>
}
