import { DataTypes } from 'sequelize';
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
} from 'sequelize-typescript';

export interface IResource {
  id: string;
  title: string;
  description: string;
  value: number;
}

@Table({
  tableName: 'resources',
})
class Resource extends Model<IResource> implements IResource {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
    id: string;

  @Unique
  @AllowNull(false)
  @Column(DataTypes.STRING)
    title: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
    description: string;

  @AllowNull(false)
  @Column(DataTypes.FLOAT)
    value: number; // TODO: Enforce unique values
}

export default Resource;