import { Op } from 'sequelize';
import { verificationCodeService } from 'services';
import db from '../../db/db';
import { IVerificationCode } from '../../db/models/verification_code';
import dotenv from 'dotenv';
import UserModel, { IUser, UserScopes } from 'db/models/user';

dotenv.config();

const validInput: Pick<IVerificationCode, 'email'> = {
  email: 'bobbobbie@test.com',
};

const invalidInput: Pick<IVerificationCode, 'email'> = {
  email: 'notvalid@test.com',
};

const user: IUser = {  
  id: '7ac85e76-e34c-4ae7-8801-8dfdf9f07a1c',
  email: 'bobbobbie@test.com',
  password: 'muncie',
  name: 'Bob Bobbie',
  role: UserScopes.Unverified,
};

let oldCode = '';

describe('verificationCodeService', () => {
  beforeAll(async () => {
    try {
      await db.authenticate();
      await db.sync();
      await UserModel.create(user);
    } catch (error) {
      console.log(error);
      throw new Error('Unable to connect to database...');
    }
  });

  afterAll(async () => {
    // Cleanup
    try {
      await UserModel.destroy({
        where: { id: { [Op.eq]: user.id } },
      });
    } catch (error) {
      console.log(error);
      throw new Error('Error while cleaning verifiation code service tests...');
    }
  });

  describe('createVerificationCode', () => {
    it('Can create a verification code', async () => {
      const code: IVerificationCode = await verificationCodeService.createVerificationCode(validInput);

      expect(code.email).toBe(validInput.email);
      expect(code.code).toBeDefined();
      expect(code.expiration).toBeDefined();

      oldCode = code.code;
    });

    it('Can generate a new, different verification code for the same user', async () => {
      const code: IVerificationCode = await verificationCodeService.createVerificationCode(validInput);

      expect(code.email).toBe(validInput.email);
      expect(code.code).not.toBe(oldCode);
      expect(code.expiration).toBeDefined();

      oldCode = code.code;
    });
  });

  describe('getVerificationCode', () => {
    it('Can get code for given email', async () => {
      const code = await verificationCodeService.getVerificationCode(validInput) as IVerificationCode;

      expect(code.email).toBe(validInput.email);
      expect(code.code).toBe(oldCode);
      expect(code.expiration).toBeDefined();
    });

    it('Return null if no code found', async () => {
      expect(() => verificationCodeService.getVerificationCode(invalidInput)).rejects.toBeDefined();
    });
  });

  describe('verifyVerificationCode', () => {
  
    it('Rejects if email does not exist', async () => {
      expect(() => verificationCodeService.verifyVerificationCode({ 
        email: invalidInput.email, 
        code: oldCode,
      })).rejects.toBeDefined();
    });

    it('Rejects if code is wrong', async () => {
      expect(() => verificationCodeService.verifyVerificationCode({ 
        email: validInput.email, 
        code: 'incorrect_code',
      })).rejects.toBeDefined();
    });

    /* TODO
    it('Rejects if code is expired', async () => {

    });
    */

    it('Accepts on correct request', async () => {
      const newUser: IUser = await verificationCodeService.verifyVerificationCode({ 
        email: validInput.email, 
        code: oldCode,
      });

      expect(newUser.id).toBe(user.id);
      expect(newUser.email).toBe(user.email);
      expect(newUser.name).toBe(user.name);
      expect(newUser.role).toBe(UserScopes.User);
    });

    it('Rejects if user is verified', async () => {
      expect(() => verificationCodeService.verifyVerificationCode({ 
        email: validInput.email, 
        code: oldCode,
      })).rejects.toBeDefined();
    });
  });

  describe('deleteVerificationCode', () => {
    it('Deletes existing code', async () => {
      await verificationCodeService.deleteVerificationCode(validInput);
      expect(() => verificationCodeService.getVerificationCode(validInput)).rejects.toBeDefined();
    });

    it('Reports zero deleted rows if no code to delete', async () => {
      expect(await verificationCodeService.deleteVerificationCode(invalidInput)).toStrictEqual(0);
    });
  });
});
