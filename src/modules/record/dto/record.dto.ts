import { IsNotEmpty, MinLength } from 'class-validator';

export class RecordDto {
    @IsNotEmpty()
    user_id: string;
    @IsNotEmpty()
    apikey: string;
    @IsNotEmpty()
    uniq: number;
    @IsNotEmpty()
    filial_name: string;

    constructor(user_id: string, apikey: string, uniq: number, filial_name: string) {
        this.filial_name = filial_name
        this.user_id = user_id
        this.apikey = apikey
        this.uniq = uniq
    }
}