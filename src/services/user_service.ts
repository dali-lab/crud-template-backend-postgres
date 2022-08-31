import DocumentNotFoundError from 'errors/DocumentNotFoundError';
import { Users } from 'models';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { UserDoc, UserFields } from 'types/models';

const getManyUsers = async (fields: FilterQuery<UserDoc>): Promise<UserDoc[]> => (
  Users.find(fields)
);

const isEmailAvailable = async (email: string): Promise<boolean> => (
  Users.findOne({ email }).lean().then((d) => !d)
);

const createUser = async (fields: UserFields): Promise<UserDoc> => (
  new Users(fields).save()
);

const getUser = async (id: string): Promise<UserDoc> => {
  const user = await Users.findById(id);
  if (!user) throw new DocumentNotFoundError(id);
  return user;
};

const updateUser = async (id: string, fields: UpdateQuery<UserDoc>): Promise<UserDoc> => {
  const user = await Users.findByIdAndUpdate(id, fields, { new: true });
  if (!user) throw new DocumentNotFoundError(id);
  return user;
};

const deleteUser = async (id: string): Promise<UserDoc> => {
  const user = await Users.findByIdAndDelete(id);
  if (!user) throw new DocumentNotFoundError(id);
  return user;
};

const userService = {
  getManyUsers,
  isEmailAvailable,
  createUser,
  getUser,
  updateUser,
  deleteUser,
};

export default userService;
