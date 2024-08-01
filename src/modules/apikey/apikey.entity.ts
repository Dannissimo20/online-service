import { Table, Column, Model, DataType} from 'sequelize-typescript';


@Table
export class Apikeys extends Model<Apikeys> {
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    uniq_key: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    apikey: string;
}