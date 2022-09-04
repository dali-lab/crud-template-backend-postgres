import {
  AllowNull,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

export interface IVerificationCode {
  /**
   * The email of the user sent this verification code. Primary key
   */
  email: string;

  /**
   * The code emailed to the user
   */
  code: string;

  /**
   * Date+time this code expires.
   */
  expiration: Date;
}

@Table({
  tableName: 'verification_codes',
})
class VerificationCode extends Model<IVerificationCode> implements IVerificationCode {
  @PrimaryKey
  @Column(DataTypes.STRING)
    email: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
    code: string;

  @AllowNull(false)
  @Column(DataTypes.DATE)
    expiration: Date;
}

export default VerificationCode;
