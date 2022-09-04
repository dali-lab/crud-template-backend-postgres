import { Op } from 'sequelize';
import VerificationCodeModel, { IVerificationCode } from 'db/models/verification_code';
import { BaseError } from 'errors';
import { userService } from 'services';
import { IUser, UserScopes } from 'db/models/user';

const generateCode = () => {
  const length = 6;
  const a = 'A'.charCodeAt(0);
  const z = 'Z'.charCodeAt(0);

  let code = '';
  for (let i = 0; i < length; i++)
    code += String.fromCharCode(Math.floor(Math.random() * (z - a + 1)) + a);

  return code;
};

const getVerificationCode = async (
  params: Pick<IVerificationCode, 'email'>,
) => {
  try {
    const res = await VerificationCodeModel.findByPk(params.email) as IVerificationCode;
    if (res === null) throw new BaseError('Code not found', 500);
    return res;
  } catch (e: any) {
    throw new BaseError(e.message, 500);
  }
};

const deleteVerificationCode = async (
  params: Pick<IVerificationCode, 'email'>,
) => {
  try {
    return await VerificationCodeModel.destroy({
      where: { email: { [Op.eq]: params.email } },
    });
  } catch (e: any) {
    throw new BaseError(e.message, 500);
  }
};

const createVerificationCode = async (
  params: Pick<IVerificationCode, 'email'>,
) => {
  // delete any previous code that may have existed
  await deleteVerificationCode(params);

  try {
    return await VerificationCodeModel.create({
      ...params,
      code: generateCode(),
      expiration: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 minutes from now
    });
  } catch (e: any) {
    throw new BaseError(e.message, 500);
  }
};

const verifyVerificationCode = async (
  params: Pick<IUser, 'email'> & Pick<IVerificationCode, 'code'>,
) => {
  // get user
  try {
    const user = await userService.getUsers({ email: params.email });
    if (user.length == 0) throw new BaseError('No user with this email exists.', 404);
    if (user[0].role !== UserScopes.Unverified) throw new BaseError('This user is already verified.', 401);

    const code = await getVerificationCode({ email: params.email });
    if (code == null || params.code != code.code) {
      throw new BaseError('Wrong verification code.', 401);
    }
    if (code.expiration.getTime() < new Date().getTime()) {
      throw new BaseError('Verification code expired.', 401);
    }

    const verifiedUser: IUser[] = await userService.editUsers(
      { role: UserScopes.User },
      { email: params.email },
    );

    // delete verification code
    await deleteVerificationCode({ email: params.email });

    return verifiedUser[0];
  } catch (e: any) {
    if (e.code) { // is instanceOf BaseError
      throw e;
    }
    throw new BaseError(e.message, 500);
  }
};

const verificationCodeService = {
  verifyVerificationCode,
  getVerificationCode,
  deleteVerificationCode,
  createVerificationCode,
};

export default verificationCodeService;
