import joi from 'joi';
import { ValidatedRequestSchema, ContainerTypes } from 'express-joi-validation';
import { IUser } from 'db/models/user';
import { IVerificationCode } from 'db/models/verification_code';

export const SignUpUserSchema = joi.object<IUser>({
  email: joi.string().email().required().error(() => 'Signup user expecting an email'),
  password: joi.string().required().error(() => 'Signup expecting a password'),
  name: joi.string().required().error(() => 'Signup expecting a name'),
});

export const ResendCodeSchema = joi.object<Pick<IUser, 'id' | 'email'>>({
  id: joi.string().required().error(() => 'Resend code expecting an id'),
  email: joi.string().email().required().error(() => 'Resend code user expecting an email'),
});

export const VerifyUserSchema = joi.object<Pick<IUser, 'id' | 'email'> & Pick<IVerificationCode, 'code'>>({
  id: joi.string().required().error(() => 'Verify user expecting an id'),
  email: joi.string().email().required().error(() => 'Verify user expecting an email'),
  code: joi.string().required().error(() => 'Verify user expecting a code'),
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
