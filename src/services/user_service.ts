// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';
import UserModel, { IUser, UserScopes } from 'db/models/user';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { DatabaseQuery } from 'types';
import { BaseError } from 'errors';

export interface UserParams {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: UserParams) => {
  const { id, email, password, name, role, limit = 30, offset = 0 } = params;
  const query: DatabaseQuery<UserParams> & {
    attributes: { exclude: string[] };
  } = {
    where: {},
    attributes: { exclude: ['password'] },
  };
  if (id) {
    query.where.id = {
      [Op.eq]: id,
    };
  }
  if (email) {
    query.where.email = {
      [Op.eq]: email,
    };
  }
  if (password) {
    query.where.password = {
      [Op.eq]: password,
    };
  }
  if (name) {
    query.where.name = {
      [Op.eq]: name,
    };
  }
  if (role) {
    query.where.role = {
      [Op.eq]: role,
    };
  }
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
  }
  return query;
};

const getUsers = async (params: Omit<UserParams, 'password'>) => {
  const query = constructQuery(params);
  try {
    return await UserModel.findAll(query);
  } catch (e : any) {
    throw new BaseError(e.message, 500);
  }
};

const editUsers = async (user: Partial<IUser>, params: UserParams) => {
  if (params.password) {
    params.password = await bcrypt.hash(params.password, 10);
  }
  const query = constructQuery(params);
  return (await UserModel.update(user, { ...query, returning: true }))[1];
};

const deleteUsers = async (params: UserParams) => {
  const query = constructQuery(params);
  try {
    return await UserModel.destroy(query);
  } catch (e : any) {
    throw new BaseError(e.message, 500);
  }
};

const isValidPassword = async (email: string, password: string) => {
  const users = await getUsers({ email });
  // get password; getUsers omits it
  const hash = (
    await UserModel.findAll({ where: { email: { [Op.eq]: email } } })
  )[0].password;

  if (users.length == 0 || hash == null) {
    throw new BaseError('No user exists with this email.', 404);
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (e : any) {
    throw new BaseError('Incorrect password', 401);
  }
};

const createUser = async (user: Pick<IUser, 'email' | 'password' | 'name'>) => {
  // check for inactive account with this email
  // db-level unique constraint on email; can assume only one user if any
  const usersSameEmail = await getUsers({
    email: user.email,
  });

  if (usersSameEmail.length == 0) {
    // TODO: change verified back to false once email verification is fixed
    try {
      return await UserModel.create({ 
        ...user, 
        id: uuidv4(),
        role: UserScopes.User, // should be UserScopes.UNVERIFIED
      });
    } catch (e : any) {
      throw e;
    }
  } else {
    throw new BaseError('Email address already associated to a user', 409);
  }
};

const userService = {
  createUser,
  getUsers,
  editUsers,
  deleteUsers,
  isValidPassword,
};

export default userService;
