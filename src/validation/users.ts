import joi from 'joi';
import { ValidatedRequestSchema, ContainerTypes } from 'express-joi-validation';
import { IUser } from '../db/models/user';

export const CreateUserSchema = joi.object<IUser>({
  email: joi.string().email().required(),
  password: joi.string().required(),
  name: joi.string().required(),
});

export interface CreateUserRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: IUser
}

export const UpdateUserSchema = joi.object<IUser>({
  id: joi.string(),
  email: joi.string().email(),
  password: joi.string(),
  name: joi.string(),
  role: joi.string(),
});

export interface UpdateUserRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: Partial<IUser>
}
