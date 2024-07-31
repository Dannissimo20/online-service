import {HttpService} from '@nestjs/axios';
import {Injectable, ParseIntPipe} from '@nestjs/common';
import {lastValueFrom, map} from "rxjs";
import {forEachResolvedProjectReference} from "ts-loader/dist/instances";

@Injectable()
export class AppService {
    constructor(private httpService: HttpService) {}

    apikey = 'd7601151be99cf3f0844d5dfc1f09e1f'
    filialId = '66991b2a2f64b85e897c4b9c'
    url = 'https://api.telebon.ru/api'

    async getDates(employee_id): Promise<any> {
        const dates = []

        const datestart = `${new Date().getFullYear()}-`+
        `${String(new Date().getMonth() + 1).padStart(2, '0')}-`+
        `${String(new Date().getDate()).padStart(2, '0')}`

        const dateend = `${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getFullYear()}-`+
        `${String(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getMonth() + 1).padStart(2, '0')}-`+
        `${String(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getDate()).padStart(2, '0')}`
        await lastValueFrom(this.httpService.post(`${this.url}/lessons/ulessons`,
            {
                apikey: this.apikey,
                employee: employee_id,
                datestart: datestart,
                dateend: dateend
            })
            .pipe(
                map(res => {
                    if (!res.data.data) {
                        return []
                    }
                    res.data.data.forEach(date => {
                        const parts = date.date.split('-')
                        dates.push(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12))
                    })
                })
            )
        )
        return dates
    }

    async getTimes(employee_id, date){
        let targetRecord :any = null
        const datestart = `${new Date().getFullYear()}-`+
            `${String(new Date().getMonth() + 1).padStart(2, '0')}-`+
            `${String(new Date().getDate()).padStart(2, '0')}`

        const dateend = `${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getFullYear()}-`+
            `${String(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getMonth() + 1).padStart(2, '0')}-`+
            `${String(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getDate()).padStart(2, '0')}`

        await lastValueFrom(this.httpService.post(`${this.url}/lessons/ulessons`,
            {
                apikey: this.apikey,
                employee: employee_id,
                datestart: datestart,
                dateend: dateend
            })
            .pipe(
                map(res => {
                    const targetDateWithoutTime = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate());
                    targetRecord = res.data.data.find(record => {
                        const recordDate = new Date(record.date);
                        const recordDateWithoutTime = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
                        return recordDateWithoutTime.getTime() === targetDateWithoutTime.getTime();
                    });
                })
            )
        )

        return targetRecord
    }

    async getUsers(service_id): Promise<any> {
        return await lastValueFrom(this.httpService.post(`${this.url}/users`,
            {
                apikey: this.apikey
            })
            .pipe(
                map(res => res.data.users
                    .filter(user => user.services === true && user.idservices
                        .some(service => service.idservice === service_id)))
            )
        );
    }

    async getServices(): Promise<any> {
        return await lastValueFrom(this.httpService.post(`${this.url}/subproducts`,
            {
                apikey: this.apikey
            })
            .pipe(
                map(res => res.data.subproduct)
            )
        )
    }

    async getCategories(): Promise<any> {
        return await lastValueFrom(this.httpService.post(`${this.url}/products`,
            {
                apikey: this.apikey
            })
            .pipe(
                map(res => res.data.product)
            )
        )
    }

    async getFilialInfo(): Promise<any> {
        return await lastValueFrom(this.httpService.post(`${this.url}/filials`,
            {
                apikey: this.apikey
            })
            .pipe(
                map(res => res.data.filial[0])
            )
        )
    }

    async spam(spam: string){
        return await lastValueFrom(this.httpService.post('https://code10.ru/server_bot/telebot/spam',
            {
                filial_id: '665dcedb373423efedbff5b3',
                message: spam
            })
            .pipe(
                map(res => res.data)
            )
        )
    }
}
