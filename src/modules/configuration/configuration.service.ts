import {Inject, Injectable} from '@nestjs/common';
import {CONFIGURATION_REPOSITORY} from "../../core/constants";
import {Configuration} from "./configuration.entity";
import {ConfigurationDto} from "./dto/configuration.dto";
import {FindOptions} from "sequelize";
import {Record} from "../record/record.entity";

@Injectable()
export class ConfigurationService {
    constructor(@Inject(CONFIGURATION_REPOSITORY) private readonly configurationRepository: typeof Configuration) { }

    async create(config: ConfigurationDto): Promise<Configuration> {
        return await this.configurationRepository.create<Configuration>(config);
    }

    async findOne(uniq: string): Promise<Configuration> {
        return await this.configurationRepository.findOne<Configuration>({where: {uniq}} as FindOptions<Configuration>);
    }

    async getWeeks(uniq: string) {
        const res = await this.configurationRepository.findOne<Configuration>({where: {uniq}} as FindOptions<Configuration>);
        if (res === null || res === undefined)
            return 4
        return res['weeks']
    }

    async update(uniq: string, data: any): Promise<Configuration> {
        const [numberOfAffectedRows, updatedConfig] = await this.configurationRepository.update({ ...data }, { where: { uniq}, returning: true });

        return updatedConfig[0];
    }
}
