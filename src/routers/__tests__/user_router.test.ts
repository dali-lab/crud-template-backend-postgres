import supertest from 'supertest';
import userRouter from 'routers/user_router';
import { userService } from 'services';
import db from '../../db/db';
import { IUser } from '../../db/models/user';

const request = supertest(userRouter);

let validId = '';
const invalidId = '365e5281-bbb5-467c-a92d-2f4041828948';

const userDataA: Omit<IUser, 'id' | 'role'> = {
  email: 'garrygergich@test.com',
  password: 'muncie',
  name: 'Garry Gergich',
};

const userDataB: Omit<IUser, 'id' | 'role'> = {
  email: 'benwyatt@test.com',
  password: 'icetown',
  name: 'Ben Wyatt',
};

// Mocks requireAuth server middleware
jest.mock('../../auth/requireAuth');
jest.mock('../../auth/requireScope');
jest.mock('../../auth/requireSelf');

describe('Working user router', () => {
  beforeAll(async () => {
    try {
      await db.authenticate();
      await db.sync();
    } catch (error) {
      throw new Error('Unable to connect to database...');
    }
  });

  describe('POST /', () => {
    it('requires valid permissions', async () => {
      const createSpy = jest.spyOn(userService, 'createUser');

      const res = await request
        .post('/')
        .send(userDataA);

      expect(res.status).toBe(403);
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('blocks creation when missing field', async () => {
      const createSpy = jest.spyOn(userService, 'createUser');

      const attempts = Object.keys(userDataA).map(async (key) => {
        const user = { ...userDataA };
        delete user[key];

        const res = await request
          .post('/')
          .set('Authorization', 'Bearer dummy_token')
          .send(user);

        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBe(1);
        expect(createSpy).not.toHaveBeenCalled();
      });
      await Promise.all(attempts);
    });

    it('blocks creation when field invalid', async () => {
      const createSpy = jest.spyOn(userService, 'createUser');

      const attempts = Object.keys(userDataA).map(async (key) => {
        const User = { ...userDataA };
        User[key] = typeof User[key] === 'number'
          ? 'some string'
          : 0;

        const res = await request
          .post('/')
          .set('Authorization', 'Bearer dummy_token')
          .send(User);

        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBe(1);
        expect(createSpy).not.toHaveBeenCalled();
      });
      await Promise.all(attempts);
    });

    it('creates user when body is valid', async () => {
      const createSpy = jest.spyOn(userService, 'createUser');

      const res = await request
        .post('/')
        .set('Authorization', 'Bearer dummy_token')
        .send(userDataA);

      expect(res.status).toBe(201);
      Object.keys(userDataA)
        .filter((key) => key !== 'password')
        .forEach((key) => {
          expect(res.body[key]).toBe(userDataA[key]);
        });
      expect(createSpy).toHaveBeenCalled();
      createSpy.mockClear();

      validId = String(res.body.id);
    });

    it('blocks user creation if email already in use', async () => {
      const createSpy = jest.spyOn(userService, 'createUser');

      const res = await request
        .post('/')
        .set('Authorization', 'Bearer dummy_token')
        .send(userDataA);

      expect(res.status).toBe(409);
      createSpy.mockClear();
    });
  });

  describe('GET /:id', () => {
    it('requires valid permissions', async () => {
      const getSpy = jest.spyOn(userService, 'getUsers');

      const res = await request
        .get(`/${validId}`)
        .send(userDataA);

      expect(res.status).toBe(403);
      expect(getSpy).not.toHaveBeenCalled();
    });

    it('returns 404 when user not found', async () => {
      const getSpy = jest.spyOn(userService, 'getUsers');

      const res = await request
        .get(`/${invalidId}`)
        .set('Authorization', 'Bearer dummy_token');

      expect(res.status).toBe(404);
      expect(getSpy).rejects.toThrowError();
      getSpy.mockClear();
    });

    it('returns user if found', async () => {
      const getSpy = jest.spyOn(userService, 'getUsers');

      const res = await request
        .get(`/${validId}`)
        .set('Authorization', 'Bearer dummy_token');

      expect(res.status).toBe(200);
      Object.keys(userDataA)
        .filter((key) => key !== 'password')
        .forEach((key) => {
          expect(res.body[key]).toBe(userDataA[key]);
        });
      expect(getSpy).toHaveBeenCalled();
      getSpy.mockClear();
    });
  });

  describe('PATCH /:id', () => {
    it('requires valid permissions', async () => {
      const updateSpy = jest.spyOn(userService, 'updateUsers');

      const res = await request
        .patch(`/${validId}`)
        .send({ value: 32 });

      expect(res.status).toBe(403);
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('returns 404 if user not found', async () => {
      const updateSpy = jest.spyOn(userService, 'updateUsers');

      const res = await request
        .patch(`/${invalidId}`)
        .set('Authorization', 'Bearer dummy_token')
        .send({ name: 'Jerry' });

      expect(res.status).toBe(404);
      expect(updateSpy).rejects.toThrowError();
      updateSpy.mockClear();
    });

    it('blocks update when field invalid', async () => {
      const updateSpy = jest.spyOn(userService, 'updateUsers');

      const attempts = Object.keys(userDataA).concat('otherkey').map(async (key) => {
        const UserUpdate = {
          [key]: typeof userDataA[key] === 'number'
            ? 'some string'
            : 0,
        };

        const res = await request
          .patch(`/${validId}`)
          .set('Authorization', 'Bearer dummy_token')
          .send(UserUpdate);

        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBe(1);
        expect(updateSpy).not.toHaveBeenCalled();
      });
      await Promise.all(attempts);
    });

    it('updates user when body is valid', async () => {
      const updateSpy = jest.spyOn(userService, 'updateUsers');

      const attempts = Object.keys(userDataB).map(async (key) => {
        const userUpdate = { [key]: userDataB[key] };

        const res = await request
          .patch(`/${validId}`)
          .set('Authorization', 'Bearer dummy_token')
          .send(userUpdate);

        expect(res.status).toBe(200);
        if (key !== 'password') {
          expect(res.body[key]).toBe(userDataB[key]);
        }
      });
      await Promise.all(attempts);

      expect(updateSpy).toHaveBeenCalledTimes(Object.keys(userDataB).length);
      updateSpy.mockClear();

      const res = await request
        .get(`/${validId}`)
        .set('Authorization', 'Bearer dummy_token');

      Object.keys(userDataB)
        .filter((key) => key !== 'password')
        .forEach((key) => {
          expect(res.body[key]).toBe(userDataB[key]);
        });
    });
  });

  describe('DELETE /:id', () => {
    it('requires valid permissions', async () => {
      const deleteSpy = jest.spyOn(userService, 'deleteUsers');

      const res = await request.delete(`/${validId}`);

      expect(res.status).toBe(403);
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('returns 404 if user not found', async () => {
      const deleteSpy = jest.spyOn(userService, 'deleteUsers');

      const res = await request
        .delete(`/${invalidId}`)
        .set('Authorization', 'Bearer dummy_token');

      expect(res.status).toBe(404);
      expect(deleteSpy).rejects.toThrowError();
      deleteSpy.mockClear();
    });

    it('deletes user', async () => {
      const deleteSpy = jest.spyOn(userService, 'deleteUsers');

      const res = await request
        .delete(`/${validId}`)
        .set('Authorization', 'Bearer dummy_token');

      expect(res.status).toBe(200);
      expect(deleteSpy).toHaveBeenCalled();
      deleteSpy.mockClear();

      const getRes = await request
        .get(`/${validId}`)
        .set('Authorization', 'Bearer dummy_token');

      expect(getRes.status).toBe(404);
    });
  });
});
