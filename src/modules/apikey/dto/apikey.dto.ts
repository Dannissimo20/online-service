import { IsNotEmpty, MinLength } from 'class-validator';

export class ApikeyDto {
    @IsNotEmpty()
    @MinLength(5)
    readonly uniq_key: number;

    @IsNotEmpty()
    readonly apikey: string;
}