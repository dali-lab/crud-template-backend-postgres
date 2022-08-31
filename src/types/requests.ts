import { Request } from 'express';
import { ValidatedRequest, ValidatedRequestSchema } from 'express-joi-validation';

import { UserDoc } from 'types/models';

export interface RequestWithJWT extends Request {
  user: UserDoc
}

export interface ValidatedRequestWithJWT<T extends ValidatedRequestSchema> extends ValidatedRequest<T> {
  user: UserDoc
}
