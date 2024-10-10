import { IsNotEmpty, MinLength } from 'class-validator';

export class ConfigurationDto {
    @IsNotEmpty()
    @MinLength(5)
    readonly uniq: string;

    @IsNotEmpty()
    readonly weeks: number;
}