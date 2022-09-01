import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import env from 'env-var';
import { RequestHandler } from 'express';
import { ValidatedRequest } from 'express-joi-validation';

import { userService } from 'services';
import { IUser } from 'db/models/user';
import { RequestWithJWT } from 'types/requests';
import { SignUpUserRequest } from 'validation/auth';

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
  } catch (error) {
    next(error);
  }
};

const signInUser: RequestHandler = (req: RequestWithJWT, res) => (
  res.json({ token: tokenForUser(req.user), user: req.user })
);

const jwtSignIn: RequestHandler = (req: RequestWithJWT, res) => (
  res.json({ user: req.user })
);

const authController = {
  signUpUser,
  signInUser,
  jwtSignIn,
};

export default authController;
