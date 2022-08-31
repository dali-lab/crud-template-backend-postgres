import { Includeable, Op } from 'sequelize/types';

export type DatabaseQuery<Params> = {
  where: {
    [fieldkey in keyof Params]?: {
      [querykey in typeof Op[keyof typeof Op]]?: Params[keyof Params];
    };
  };
  limit?: number;
  offset?: number;
  include?: Includeable[];
};