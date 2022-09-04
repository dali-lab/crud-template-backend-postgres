import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import env from 'env-var';
import { RequestHandler } from 'express';
import { ValidatedRequest } from 'express-joi-validation';

import { userService, verificationCodeService } from 'services';
import { IUser } from 'db/models/user';
import { RequestWithJWT } from 'auth/requests';
import { ResendCodeRequest, SignUpUserRequest, VerifyUserRequest } from 'validation/auth';
import { BaseError } from 'errors';

dotenv.config();

const tokenForUser = (user: IUser): string => {
  const timestamp = new Date().getTime();
  const exp = Math.round((timestamp + 2.628e+9) / 1000);
  return jwt.encode({ sub: user.id, iat: timestamp, exp }, env.get('AUTH_SECRET').required().asString());
};

const signUpUser: RequestHandler = async (req: ValidatedRequest<SignUpUserRequest>, res, next) => {
  try {
    const {
      email, password, name,
    } = req.body;

    // Make a new user from passed data
    const savedUser = await userService.createUser({
      email,
      password,
      name,
    });

    // Save the user then transmit to frontend
    res.status(201).json({ token: tokenForUser(savedUser), user: savedUser });
  } catch (error : any) {
    next(error);
  }
};

const signInUser: RequestHandler = (req: RequestWithJWT, res) => (
  res.json({ token: tokenForUser(req.user), user: req.user })
);

const jwtSignIn: RequestHandler = (req: RequestWithJWT, res) => (
  res.json({ user: req.user })
);

const resendCode: RequestHandler = async (req: ValidatedRequest<ResendCodeRequest>, res, next) => {
  try {
    const {
      email,
    } = req.body;

    const users: IUser[] = await userService.getUsers({ email });
    if (users.length === 0) throw new BaseError('No user with that email', 400);
    
    const newCode = await verificationCodeService.createVerificationCode({ email });
    res.status(201).json({ email, code: newCode });
  } catch (error : any) {
    next(error);
  }
}; 

const verifyUser: RequestHandler = async (req: ValidatedRequest<VerifyUserRequest>, res, next) => {
  try {
    const {
      email, code,
    } = req.body;

    const user = await verificationCodeService.verifyVerificationCode({ email, code });

    res.status(200).json({ token: tokenForUser(user), user });
  } catch (error : any) {
    next(error);
  }
};

const authController = {
  signUpUser,
  signInUser,
  jwtSignIn,
  resendCode,
  verifyUser,
};

export default authController;
