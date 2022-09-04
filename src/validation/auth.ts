import joi from 'joi';
import { ValidatedRequestSchema, ContainerTypes } from 'express-joi-validation';
import { IUser } from 'db/models/user';
import { IVerificationCode } from 'db/models/verification_code';

export const SignUpUserSchema = joi.object<IUser>({
  email: joi.string().email().required(),
  password: joi.string().required(),
  name: joi.string().required(),
});

export const ResendCodeSchema = joi.object<Pick<IUser, 'email'>>({
  email: joi.string().email().required(),
});

export const VerifyUserSchema = joi.object<Pick<IUser, 'email'> & Pick<IVerificationCode, 'code'>>({
  email: joi.string().email().required(),
  code: joi.string().required(),
});

export interface SignUpUserRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: IUser
}

export interface ResendCodeRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: Pick<IUser, 'email'>
}

export interface VerifyUserRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: Pick<IUser, 'email'> & Pick<IVerificationCode, 'code'>
}
