import { Request } from 'express';
import { ValidatedRequest, ValidatedRequestSchema } from 'express-joi-validation';

import { IUser } from 'db/models/user';

export interface RequestWithJWT extends Request {
  user: IUser
}

export interface ValidatedRequestWithJWT<T extends ValidatedRequestSchema> extends ValidatedRequest<T> {
  user: IUser
}
