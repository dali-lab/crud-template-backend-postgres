import bcrypt from 'bcrypt';
import { userService } from 'services';
import { UserScopes } from 'db/models/user'; 
import db from '../../db/db';
import { IUser } from '../../db/models/user';
import dotenv from 'dotenv';

dotenv.config();

let idUserA = '';
let idUserB = '';
const invalidId = '365e5281-bbb5-467c-a92d-2f4041828948';

const userDataA: Omit<IUser, 'id'> = {
  email: 'garrygergich@test.com',
  password: 'muncie',
  name: 'Garry Gergich',
  role: UserScopes.User,
};

const userDataB: Omit<IUser, 'id'> = {
  email: 'benwyatt@test.com',
  password: 'icetown',
  name: 'Ben Wyatt',
  role: UserScopes.User,
};

describe('userService', () => {
  beforeAll(async () => {
    try {
      await db.authenticate();
      await db.sync();
    } catch (error) {
      console.log(error);
      throw new Error('Unable to connect to database...');
    }
  });
  
  describe('createUser', () => {
    it('Can create user A', async () => {
      const user: IUser = await userService.createUser(userDataA);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(userDataA.email);
      expect(user.name).toBe(userDataA.name);

      const passCompareResult = await new Promise<boolean>((resolve, reject) => {
        bcrypt.compare(userDataA.password, user.password, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });

      expect(passCompareResult).toBe(true);
      idUserA = String(user.id);
    });

    it('Rejects if email already used', async () => {
      expect(userService.createUser(userDataA)).rejects.toBeDefined();
    });

    it('Can create user B', async () => {
      const user: IUser = await userService.createUser(userDataB);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(userDataB.email);
      expect(user.name).toBe(userDataB.name);

      const passCompareResult = await new Promise<boolean>((resolve, reject) => {
        bcrypt.compare(userDataB.password, user.password, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });

      expect(passCompareResult).toBe(true);
      idUserB = String(user.id);
    });
  });

  describe('getUsers', () => {
    it('Can get user', async () => {
      const user: IUser = await userService.getUsers({ id: idUserA }).then((res) => res[0]);

      expect(user.email).toBe(userDataA.email);
      expect(user.password).not.toBe(userDataA.password);
      expect(user.name).toBe(userDataA.name);
    });

    it('Returns empty array if no users to get', async () => {
      expect(await userService.getUsers({ id: invalidId })).toStrictEqual([]);
    });
  });

  describe('editUsers', () => {
    it('Updates user field', async () => {
      const newName = 'Jerry Jerry';

      const updatedUser1: IUser = await userService.editUsers({ name: newName }, { id: idUserA }).then((res) => res[0]);
      expect(updatedUser1.name).toBe(newName);

      const updatedUser2: IUser = await userService.getUsers({ id: idUserA }).then((res) => res[0]);
      expect(updatedUser2.name).toBe(newName);
    });

    it('Returns empty array if no users to edit', async () => {
      expect(await userService.editUsers({ id: invalidId }, { name: 'Larry' })).toStrictEqual([]);
    });
  });

  describe('deleteUsers', () => {
    it('Deletes existing user A', async () => {
      await userService.deleteUsers({ id: idUserA });
      expect(await userService.getUsers({ id: idUserA })).toStrictEqual([]);
    });
    it('Deletes existing user B', async () => {
      await userService.deleteUsers({ id: idUserB });
      expect(await userService.getUsers({ id: idUserB })).toStrictEqual([]);
    });

    it('Reports zero deleted rows if no users to delete', async () => {
      expect(await userService.deleteUsers({ id: invalidId })).toStrictEqual(0);
    });
  });

});
