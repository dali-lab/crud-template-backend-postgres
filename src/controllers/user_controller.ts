/* eslint-disable @typescript-eslint/naming-convention */
import { RequestHandler } from 'express';
import { ValidatedRequest } from 'express-joi-validation';

import { BaseError } from 'errors';
import { getSuccessfulDeletionMessage } from 'helpers/constants';
import { userService } from 'services';
import { CreateUserRequest, UpdateUserRequest } from 'validation/users';

const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await userService.getManyUsers({});
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const createNewUser: RequestHandler = async (req: ValidatedRequest<CreateUserRequest>, res, next) => {
  try {
    const {
      email, password, first_name: firstName, last_name: lastName,
    } = req.body;

    const emailAvailable = await userService.isEmailAvailable(email);
    if (!emailAvailable) throw new BaseError('Email address already associated to a user', 409);

    const newUser = await userService.createUser({
      email,
      password,
      first_name: firstName ?? '',
      last_name: lastName ?? '',
      scope: 'USER',
    });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

const getUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await userService.getUser(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser: RequestHandler = async (req: ValidatedRequest<UpdateUserRequest>, res, next) => {
  try {
    // ! Only allow user to update certain fields (avoids privilege elevation)
    const { first_name, last_name, email } = req.body;
    const updatedUser = await userService.updateUser(
      req.params.id,
      { first_name, last_name, email },
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: getSuccessfulDeletionMessage(req.params.id) });
  } catch (error) {
    next(error);
  }
};

const userController = {
  getAllUsers,
  createNewUser,
  getUser,
  updateUser,
  deleteUser,
};

export default userController;
