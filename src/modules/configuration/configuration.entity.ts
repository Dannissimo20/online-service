import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Configuration extends Model<Configuration> {
  @Column({
    allowNull: false,
    unique: true,
    type: DataType.TEXT,
  })
  uniq: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  weeks: number;
}
