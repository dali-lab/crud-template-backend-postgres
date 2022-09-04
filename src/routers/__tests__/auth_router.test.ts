import { Op } from 'sequelize';
import supertest from 'supertest';
import authRouter from 'routers/auth_router';
import { userService, verificationCodeService } from 'services';
import db from '../../db/db';
import UserModel, { IUser, UserScopes } from '../../db/models/user';

const request = supertest(authRouter);

// Mocks requireAuth server middleware
jest.mock('../../auth/requireAuth');
jest.mock('../../auth/requireScope');
jest.mock('../../auth/requireSelf');

const mockUser: Omit<IUser, 'id' | 'role'> = {
  email: 'test@test.com',
  password: 'password',
  name: 'Joe Smith',
};

let userId  = '';
let code = '';

describe('Working auth router', () => {
  beforeAll(async () => {
    try {
      await db.authenticate();
      await db.sync();
    } catch (error) {
      throw new Error('Unable to connect to database...');
    }
  });

  afterAll(async () => {
    // Cleanup
    try {
      await UserModel.destroy({
        where: { id: { [Op.eq]: userId } },
      });
    } catch (error) {
      console.log(error);
      throw new Error('Error while cleaning verifiation code service tests...');
    }
  });

  describe('POST /signup', () => {
    it('blocks creation when missing field', async () => {
      const createSpy = jest.spyOn(userService, 'createUser');

      const attempts = Object.keys(mockUser).map(async (key) => {
        const user = { ...mockUser };
        delete user[key];

        const res = await request
          .post('/signup')
          .send(user);

        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBe(1);
        expect(createSpy).not.toHaveBeenCalled();
      });

      await Promise.all(attempts);
    });

    it('blocks creation when field invalid', async () => {
      const createSpy = jest.spyOn(userService, 'createUser');

      const attempts = Object.keys(mockUser).map(async (key) => {
        const User = { ...mockUser };
        User[key] = typeof User[key] === 'number'
          ? 'some string'
          : 0;

        const res = await request
          .post('/signup')
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
        .post('/signup')
        .send(mockUser);

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      Object.keys(mockUser)
        .filter((key) => key !== 'password')
        .forEach((key) => {
          expect(res.body.user[key]).toBe(mockUser[key]);
        });

      expect(createSpy).toHaveBeenCalled();
      createSpy.mockClear();

      userId = res.body.user.id;
    });
  });

  describe('POST /signin', () => {
    it('rejects requests without both email and password', async () => {
      const attempts = ['email', 'password', ''].map(async (key) => {
        const user = key
          ? { [key]: mockUser[key] }
          : {};

        const res = await request
          .post('/signin')
          .send(user);

        expect(res.status).toBe(400);
      });

      await Promise.all(attempts);
    });

    it('rejects emails with no associated users', async () => {
      const res = await request
        .post('/signin')
        .send({ email: 'not an email', password: mockUser.password });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Email address not associated with a user');
    });

    it('returns 401 on incorrect password', async () => {
      const res = await request
        .post('/signin')
        .send({ email: mockUser.email, password: 'wrong password' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Incorrect password');
    });

    it('returns valid token and JSON user object', async () => {
      const res = await request.post('/signin').send(mockUser);
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      Object.keys(mockUser)
        .filter((key) => key !== 'password')
        .forEach((key) => {
          expect(res.body.user[key]).toBe(mockUser[key]);
        });
    });
  });

  describe('GET /jwt-signin', () => {
    it('requires jwt token', async () => {
      const res = await request.get('/jwt-signin');
      expect(res.status).toBe(401);
    });

    it('sends user JSON corresponding to jwt', async () => {
      const res = await request
        .get('/jwt-signin')
        .set('Authorization', 'Bearer dummy_token');

      expect(res.status).toBe(200);
      Object.keys(mockUser)
        .filter((key) => key !== 'password')
        .forEach((key) => {
          expect(res.body.user[key]).toBe(mockUser[key]);
        });
    });
  });

  describe('POST /resend-code', () => {
    it('requires valid permissions', async () => {
      const resendSpy = jest.spyOn(verificationCodeService, 'createVerificationCode');

      const res = await request
        .post('/resend-code')
        .send({ email: mockUser.email });

      expect(res.status).toBe(403);
      expect(resendSpy).not.toHaveBeenCalled();
    });

    it('blocks creation when field invalid', async () => {
      const resendSpy = jest.spyOn(verificationCodeService, 'createVerificationCode');

      const res = await request
        .post('/resend-code')
        .set('Authorization', 'Bearer dummy_token')
        .send({ email: 'fakeemail@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.errors.length).toBe(1);
      expect(resendSpy).not.toHaveBeenCalled();
    });

    it('creates resource when body is valid', async () => {
      const resendSpy = jest.spyOn(verificationCodeService, 'createVerificationCode');

      const res = await request
        .post('/resend-code')
        .set('Authorization', 'Bearer dummy_token')
        .send({ email: mockUser.email });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe(mockUser.email);
      expect(res.body.code).toBeDefined();
      expect(resendSpy).toHaveBeenCalled();
      resendSpy.mockClear();

      code = res.body.code.code;
    });
  });

  describe('PATCH /verify', () => {
    it('requires valid permissions', async () => {
      const verifySpy = jest.spyOn(verificationCodeService, 'createVerificationCode');

      const res = await request
        .patch('/verify')
        .send({ email: mockUser.email });

      expect(res.status).toBe(403);
      expect(verifySpy).not.toHaveBeenCalled();
    });

    it('blocks verification when field invalid', async () => {
      const verifySpy = jest.spyOn(verificationCodeService, 'createVerificationCode');

      const res1 = await request
        .patch('/verify')
        .set('Authorization', 'Bearer dummy_token')
        .send({ email: 'fakeemail@test.com', code });

      expect(res1.status).toBe(404);
      expect(res1.body.errors.length).toBe(1);
      expect(verifySpy).not.toHaveBeenCalled();

      const res2 = await request
        .patch('/verify')
        .set('Authorization', 'Bearer dummy_token')
        .send({ email: mockUser.email, code: 'not a code' });

      expect(res2.status).toBe(401);
      expect(res2.body.errors.length).toBe(1);
      expect(verifySpy).not.toHaveBeenCalled();
    });

    it('verifies user when body is valid', async () => {
      const verifySpy = jest.spyOn(verificationCodeService, 'verifyVerificationCode');

      const res = await request
        .patch('/verify')
        .set('Authorization', 'Bearer dummy_token')
        .send({ email: mockUser.email, code });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      Object.keys(mockUser)
        .filter((key) => key !== 'password')
        .forEach((key) => {
          if (key === 'role') {
            expect(res.body.user[key]).toBe(UserScopes.User);
          } else {
            expect(res.body.user[key]).toBe(mockUser[key]);
          }
        });

      expect(verifySpy).toHaveBeenCalled();
      verifySpy.mockClear();
    });
  });
});

// TODO: Delete created user after these tests are run
