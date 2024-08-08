import {Inject, Injectable} from '@nestjs/common';
import {Record} from "./record.entity";
import {RECORD_REPOSITORY} from "../../core/constants";
import {RecordDto} from "./dto/record.dto";
import {FindOptions} from "sequelize";

@Injectable()
export class RecordService {
    constructor(@Inject(RECORD_REPOSITORY) private readonly recordRepository: typeof Record) { }

    async findAll(): Promise<Record[]> {
        return await this.recordRepository.findAll<Record>();
    }

    async findOne(user_id): Promise<Record> {
        return await this.recordRepository.findOne({where: { user_id }} as FindOptions<Record>);
    }

    async getEmployeeId(user_id) {
        const record = await this.recordRepository.findOne({where: { user_id }} as FindOptions<Record>);
        return record['employee_id']
    }

    async getEmployeeFio(user_id) {
        const record = await this.recordRepository.findOne({where: { user_id }} as FindOptions<Record>);
        return record['employee_fio']
    }

    async getService(user_id) {
        const record = await this.recordRepository.findOne({where: { user_id }} as FindOptions<Record>);
        return [{
            id: record['service_id'],
            duration: record['service_duration'],
            tarif: record['service_tarif'],
            name: record['service_name']
        }]
    }

    async getFilialName(user_id){
        const record = await this.recordRepository.findOne({where: { user_id }} as FindOptions<Record>);
        return record['filial_name']
    }

    async getDate(user_id) {
        const record = await this.recordRepository.findOne({where: { user_id }} as FindOptions<Record>);
        return record['date']
    }

    async delete(user_id) {
        return await this.recordRepository.destroy({ where: { user_id } });
    }

    async create(record: RecordDto): Promise<Record> {
        return await this.recordRepository.create<Record>(record);
    }

    async update(user_id, data) {
        const [numberOfAffectedRows, updatedPost] = await this.recordRepository.update({ ...data }, { where: { user_id}, returning: true });

        return updatedPost;
    }
}
