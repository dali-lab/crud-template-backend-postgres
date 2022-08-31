import joi from 'joi';
import { ValidatedRequestSchema, ContainerTypes } from 'express-joi-validation';
import { IUser } from 'db/models/user';

export const SignUpUserSchema = joi.object<IUser>({
  email: joi.string().email().required(),
  password: joi.string().required(),
  name: joi.string().required(),
});

export interface SignUpUserRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: IUser
}
