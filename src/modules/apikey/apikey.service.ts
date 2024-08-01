import {Inject, Injectable} from '@nestjs/common';
import {APIKEY_REPOSITORY} from "../../core/constants";
import {Apikeys} from "./apikey.entity";
import {ApikeyDto} from "./dto/apikey.dto";

@Injectable()
export class ApikeyService {
    constructor(@Inject(APIKEY_REPOSITORY) private readonly apikeyRepository: typeof Apikeys) { }

    async create(apikey: ApikeyDto): Promise<Apikeys> {
        return await this.apikeyRepository.create<Apikeys>(apikey);
    }

    async findOne(uniq_key: number): Promise<Apikeys> {
        return await this.apikeyRepository.findOne<Apikeys>({where: {uniq_key}});
    }
}
