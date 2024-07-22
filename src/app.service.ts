import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {lastValueFrom, map} from "rxjs";

@Injectable()
export class AppService {
    constructor(private httpService: HttpService) {}

    apikey = 'd7601151be99cf3f0844d5dfc1f09e1f'
    url = 'https://api.telebon.ru/api'
    async getUsers(): Promise<any> {
        return await lastValueFrom(this.httpService.post(`${this.url}/users`,
            {
                apikey: this.apikey
            })
            .pipe(
                map(res => res.data.users)
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
