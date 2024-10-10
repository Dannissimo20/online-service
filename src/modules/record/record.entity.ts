import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table
export class Record extends Model<Record> {
    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    user_id: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    uniq: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    apikey: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    filial_name: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    service_id: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    service_duration: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    service_tarif: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    service_name: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    service_interval: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    employee_id: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    employee_fio: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    date: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    start_time: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    end_time: string;
}