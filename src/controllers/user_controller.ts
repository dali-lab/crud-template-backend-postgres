/* eslint-disable @typescript-eslint/naming-convention */
import { RequestHandler } from 'express';
import { ValidatedRequest } from 'express-joi-validation';

import { getSuccessfulDeletionMessage } from 'helpers/constants';
import { createUser, getUsers, editUsers, deleteUsers } from 'services';
import { CreateUserRequest, UpdateUserRequest } from 'validation/users';
import { IUser } from 'db/models/user'; 

export const createNewUser: RequestHandler = async (req: ValidatedRequest<CreateUserRequest>, res, next) => {
  try {
    const {
      email, 
      password, 
      name,
    } = req.body;

    const newUser = await createUser({ email, password, name });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const getUser: RequestHandler = async (req, res, next) => {
  try {
    const users : IUser[] = await getUsers({ id: req.params.id });
    res.status(200).json(users[0]);
  } catch (error) {
    next(error);
  }
};

export const updateUser: RequestHandler = async (req: ValidatedRequest<UpdateUserRequest>, res, next) => {
  try {
    // ! Only allow user to update certain fields (avoids privilege elevation)
    const { id } = req.body;
    const { name, email } = req.query;
    const updatedUser = await editUsers(
      { id },
      { name, email },
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    await deleteUsers({ id: req.params.id });
    res.json({ message: getSuccessfulDeletionMessage(req.params.id) });
  } catch (error) {
    next(error);
  }
};
