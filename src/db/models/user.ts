import { DataTypes } from 'sequelize';
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  BeforeCreate,
} from 'sequelize-typescript';
import bcrypt from 'bcrypt';

export interface IUser {
  id: string;
  email: string;
  password: string; // encrypted
  name: string;
  verified: boolean; // True if user has verified their account via email
}

@Table({
  tableName: 'users',
})
class User extends Model<IUser> implements IUser {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
    id: string;

  @Unique
  @AllowNull(false)
  @Column(DataTypes.STRING)
    email: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
    password: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
    name: string;

  @Default(false)
  @AllowNull(false)
  @Column(DataTypes.BOOLEAN)
    verified: boolean;

  @BeforeCreate
  static encryptPassword = async (instance: IUser) => {
      instance.password = await bcrypt.hash(instance.password, 10);
    };
}

export default User;