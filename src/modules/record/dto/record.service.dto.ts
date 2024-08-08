import { IsNotEmpty, MinLength } from 'class-validator';

export class RecordServiceDto {

    service_id: string;

    service_duration: string;

    service_tarif: number;

    service_name: string;

    constructor(service_id: any, service_duration: any, service_tarif: any, service_name: any) {
        this.service_id = service_id
        this.service_duration = service_duration
        this.service_tarif = service_tarif
        this.service_name = service_name
    }
}