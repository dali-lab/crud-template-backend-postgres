import bcrypt from 'bcrypt';

import { userService } from 'services';
import { UserFields } from 'types/models';

import {
  connectDB, dropDB,
} from '../../../__jest__/helpers';

let idUserA = '';
const invalidId = 'invalidId';

const userDataA: UserFields = {
  email: 'garrygergich@test.com',
  password: 'muncie',
  first_name: 'Garry',
  last_name: 'Gergich',
  scope: 'USER',
};

const userDataB: UserFields = {
  email: 'benwyatt@test.com',
  password: 'icetown',
  first_name: 'Ben',
  last_name: 'Wyatt',
  scope: 'USER',
};

describe('userService', () => {
  beforeAll(async () => {
    connectDB();
  });

  afterAll(async () => {
    dropDB();
  });

  describe('createUser', () => {
    it('Can create user', async () => {
      const user = await userService.createUser(userDataA);

      expect(user._id).toBeDefined();
      expect(user.email).toBe(userDataA.email);
      expect(user.first_name).toBe(userDataA.first_name);
      expect(user.last_name).toBe(userDataA.last_name);

      const passCompareResult = await new Promise<boolean>((resolve, reject) => {
        bcrypt.compare(userDataA.password, user.password, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });

      expect(passCompareResult).toBe(true);
      idUserA = String(user._id);
    });

    it('Rejects if email already used', async () => {
      expect(userService.createUser(userDataA)).rejects.toBeDefined();
    });

    it('Can create second user', async () => {
      const user = await userService.createUser(userDataB);

      expect(user._id).toBeDefined();
      expect(user.email).toBe(userDataB.email);
      expect(user.first_name).toBe(userDataB.first_name);
      expect(user.last_name).toBe(userDataB.last_name);

      const passCompareResult = await new Promise<boolean>((resolve, reject) => {
        bcrypt.compare(userDataB.password, user.password, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });

      expect(passCompareResult).toBe(true);
    });
  });

  describe('getUser', () => {
    it('Can get user', async () => {
      const user = await userService.getUser(idUserA);

      expect(user.email).toBe(userDataA.email);
      expect(user.password).not.toBe(userDataA.password);
      expect(user.first_name).toBe(userDataA.first_name);
      expect(user.last_name).toBe(userDataA.last_name);
    });

    it('Rejects if user does not exist', async () => {
      expect(userService.getUser(invalidId)).rejects.toBeDefined();
    });
  });

  describe('getManyUsers', () => {
    it('Gets all users when no filter passed in', async () => {
      const users = await userService.getManyUsers({});
      expect(users.length).toBe(2);
    });

    it('Gets all users that match filter', async () => {
      const users = await userService.getManyUsers({ first_name: userDataA.first_name });
      expect(users.length).toBe(1);
    });
  });

  describe('updateUser', () => {
    it('Updates user field', async () => {
      const newName = 'Jerry';

      const updatedUser1 = await userService.updateUser(idUserA, { first_name: newName });
      expect(updatedUser1.first_name).toBe(newName);

      const updatedUser2 = await userService.getUser(idUserA);
      expect(updatedUser2.first_name).toBe(newName);
    });

    it('Rejects if user does not exist', async () => {
      expect(userService.updateUser(invalidId, { first_name: 'Larry' })).rejects.toBeDefined();
    });

    it('Does not add field thats not part of schema', async () => {
      const user = await userService.updateUser(idUserA, { favorite_food: 'Brussel Sprouts' });
      expect((user as any).favorite_food).toBeUndefined();
    });
  });

  describe('isEmailAvailable', () => {
    it('Know if email is available', async () => {
      const emailAvailable = await userService.isEmailAvailable('jerrygergich@test.com');
      expect(emailAvailable).toBe(true);
    });

    it('Know if email is not available', async () => {
      const emailAvailable = await userService.isEmailAvailable(userDataA.email);
      expect(emailAvailable).toBe(false);
    });
  });

  describe('deleteUser', () => {
    it('Deletes existing user', async () => {
      await userService.deleteUser(idUserA);
      expect(userService.getUser(idUserA)).rejects.toBeDefined();
    });

    it('Rejects if user does not exist', async () => {
      expect(userService.deleteUser(invalidId)).rejects.toBeDefined();
    });
  });
});
