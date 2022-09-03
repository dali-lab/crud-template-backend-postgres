/* eslint-disable @typescript-eslint/naming-convention */
import { RequestHandler } from 'express';
import { ValidatedRequest } from 'express-joi-validation';
import { getSuccessfulDeletionMessage } from '../constants';
import { userService } from 'services';
import { CreateUserRequest, UpdateUserRequest } from 'validation/users';
import { IUser } from 'db/models/user'; 
import { BaseError } from 'errors';

const createNewUser: RequestHandler = async (req: ValidatedRequest<CreateUserRequest>, res, next) => {
  try {
    const {
      email, 
      password, 
      name,
    } = req.body;

    const newUser = await userService.createUser({ email, password, name });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

const getUser: RequestHandler = async (req, res, next) => {
  try {
    const users : IUser[] = await userService.getUsers({ id: req.params.id });
    if (users.length === 0) throw new BaseError('User not found', 404);
    else res.status(200).json(users[0]);
  } catch (error) {
    next(error);
  }
};

const updateUser: RequestHandler = async (req: ValidatedRequest<UpdateUserRequest>, res, next) => {
  try {
    // ! Only allow user to update certain fields (avoids privilege elevation)
    const { email, password, name } = req.body;

    const updatedUsers = await userService.editUsers(
      { email, password, name },
      { id: req.params.id },
    );

    if (updatedUsers.length === 0) throw new BaseError('User not found', 404);
    else res.status(200).json(updatedUsers[0]);
  } catch (error) {
    next(error);
  }
};

const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const users : IUser[] = await userService.getUsers({ id: req.params.id });
    if (users.length === 0) throw new BaseError('User not found', 404);
    else {
      await userService.deleteUsers({ id: req.params.id });
      res.json({ message: getSuccessfulDeletionMessage(req.params.id) });
    }
  } catch (error) {
    next(error);
  }
};

const userController = {
  createNewUser,
  getUser,
  updateUser,
  deleteUser,
};

export default userController;
