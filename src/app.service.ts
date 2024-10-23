import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, lastValueFrom, map, throwError } from 'rxjs';
import { config } from '../config';
import { format } from 'date-fns';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  apikey = 'd7601151be99cf3f0844d5dfc1f09e1f';
  filialId = '66991b2a2f64b85e897c4b9c';
  url = config.api;
  //url = "https://dev.api.telebon.ru/api"

  async setApikey(apikey: string) {
    this.apikey = apikey;
  }

  async getDates(employee_id, apikey, weeks): Promise<any> {
    const dates = [];

    const datestart =
      `${new Date().getFullYear()}-` +
      `${String(new Date().getMonth() + 1).padStart(2, '0')}-` +
      `${String(new Date().getDate()).padStart(2, '0')}`;

    const dateend =
      `${new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).getFullYear()}-` +
      `${String(new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).getMonth() + 1).padStart(2, '0')}-` +
      `${String(new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).getDate()).padStart(2, '0')}`;
    await lastValueFrom(
      this.httpService
        .post(`${this.url}/lessons/ulessons`, {
          apikey: apikey,
          employee: employee_id,
          datestart: datestart,
          dateend: dateend,
        })
        .pipe(
          map((res) => {
            if (!res.data.data) {
              return [];
            }
            res.data.data.forEach((date) => {
              const parts = date.date.split('-');
              dates.push(
                new Date(
                  parseInt(parts[0]),
                  parseInt(parts[1]) - 1,
                  parseInt(parts[2]),
                  12,
                ),
              );
            });
          }),
        ),
    );
    return dates;
  }

  async getTimes1(employee_id, weeks, apikey, service, date) {
    let datestart;
    let dateend;
    if (date === null) {
      datestart =
        `${new Date().getFullYear()}-` +
        `${String(new Date().getMonth() + 1).padStart(2, '0')}-` +
        `${String(new Date().getDate()).padStart(2, '0')}`;

      dateend =
        `${new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).getFullYear()}-` +
        `${String(new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).getMonth() + 1).padStart(2, '0')}-` +
        `${String(new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).getDate()).padStart(2, '0')}`;
    } else {
      datestart = date;
      dateend = date;
    }

    return await lastValueFrom(
      this.httpService
        .post(`${this.url}/users/timeslot`, {
          apikey: apikey,
          employeeid: employee_id,
          datestart: datestart,
          datefinish: dateend,
          interval: service['intervalonlinebooking'],
          duration: parseInt(service['duration']),
        })
        .pipe(
          map((res) => res.data.dates),
          catchError((err) => {
            console.log(err);
            return throwError('Something went wrong with the request.');
          }),
        ),
    );
  }

  async getFirstFreeTime(employee_id, weeks, apikey, service, datestart) {
    const dateend =
      `${new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).getFullYear()}-` +
      `${String(new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).getMonth() + 1).padStart(2, '0')}-` +
      `${String(new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).getDate()).padStart(2, '0')}`;

    return await lastValueFrom(
      this.httpService
        .post(`${this.url}/users/timeslot`, {
          apikey: apikey,
          employeeid: employee_id,
          datestart: datestart,
          datefinish: dateend,
          interval: service['intervalonlinebooking'],
          duration: parseInt(service['duration']),
        })
        .pipe(
          map((res) => res.data.dates),
          catchError((err) => {
            console.log(err);
            return throwError('Something went wrong with the request.');
          }),
        ),
    );
  }

  // TODO: добавить проверку на занятость времени
  async getTimes(employee_id, date, apikey) {
    let targetRecord: any = null;
    const datestart =
      `${new Date().getFullYear()}-` +
      `${String(new Date().getMonth() + 1).padStart(2, '0')}-` +
      `${String(new Date().getDate()).padStart(2, '0')}`;

    const dateend =
      `${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getFullYear()}-` +
      `${String(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getMonth() + 1).padStart(2, '0')}-` +
      `${String(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getDate()).padStart(2, '0')}`;

    await lastValueFrom(
      this.httpService
        .post(`${this.url}/lessons/ulessons`, {
          apikey: apikey,
          employee: employee_id,
          datestart: datestart,
          dateend: dateend,
        })
        .pipe(
          map((res) => {
            const targetDateWithoutTime = new Date(
              new Date(date).getFullYear(),
              new Date(date).getMonth(),
              new Date(date).getDate(),
            );
            targetRecord = res.data.data.find((record) => {
              const recordDate = new Date(record.date);
              const recordDateWithoutTime = new Date(
                recordDate.getFullYear(),
                recordDate.getMonth(),
                recordDate.getDate(),
              );
              return (
                recordDateWithoutTime.getTime() ===
                targetDateWithoutTime.getTime()
              );
            });
          }),
        ),
    );

    return targetRecord;
  }

  async getEmployees(service_id, apikey): Promise<any> {
    return await lastValueFrom(
      this.httpService
        .post(`${this.url}/users`, {
          apikey: apikey,
        })
        .pipe(
          map((res) =>
            res.data.users.filter(
              (user) =>
                user.services === true &&
                user.idservices.some(
                  (service) => service.idservice === service_id,
                ) &&
                user.onlinerec === true,
            ),
          ),
        ),
    );
  }

  async getCurrentUser(user_id, apikey): Promise<any> {
    return await lastValueFrom(
      this.httpService
        .post(`${this.url}/users`, {
          apikey: apikey,
        })
        .pipe(
          map((res) => res.data.users.filter((user) => user.id === user_id)),
        ),
    );
  }

  async getServices(apikey: string): Promise<any> {
    return await lastValueFrom(
      this.httpService
        .post(`${this.url}/subproducts`, {
          apikey: apikey,
        })
        .pipe(
          map((res) =>
            res.data.subproduct.filter(
              (subproduct) =>
                subproduct.group === 'no' &&
                subproduct.onlinebooking === true &&
                subproduct.employee.length !== 0,
            ),
          ),
        ),
    );
  }

  async getCategories(apikey: string): Promise<any> {
    return await lastValueFrom(
      this.httpService
        .post(`${this.url}/products`, {
          apikey: apikey,
        })
        .pipe(map((res) => res.data.product)),
    );
  }

  async getFilialInfo(apikey: string): Promise<any> {
    return await lastValueFrom(
      this.httpService
        .post(`${this.url}/filials`, {
          apikey: apikey,
        })
        .pipe(map((res) => res.data.filial[0])),
    );
  }

  async findClient(phone, apikey) {
    return await lastValueFrom(
      this.httpService
        .post(`${this.url}/findclient`, {
          apikey: apikey,
          phone: phone,
        })
        .pipe(map((res) => res.data.clients)),
    );
  }

  async addClient(phone, fio, apikey) {
    const filial = await this.getFilialInfo(apikey);
    return await lastValueFrom(
      this.httpService.put(`${this.url}/client`, {
        apikey: apikey,
        phone: phone,
        name: fio,
        filial: filial.id,
      }),
    );
  }

  async add_record(record, client) {
    return await lastValueFrom(
      this.httpService.put(`${this.url}/lesson`, {
        anyemployedid: [
          {
            idemployed: record['employee_id'],
          },
        ],
        anysubproductid: [
          {
            idsubproduct: record['service_id'],
            serviceDuration: record['service_duration'],
            servicePrice: record['service_tarif'],
            servicename: record['service_name'],
          },
        ],
        clientId: [
          {
            idclient: client.id,
            confirmation: 1,
          },
        ],
        employedid: record['employee_id'],
        end: record['date'] + ' ' + record['end_time'] + ':00',
        filialId: client.filial,
        paymentFullComplete: 'no',
        start: record['date'] + ' ' + record['start_time'] + ':00',
        subproductId: record['service_id'],
        typerecord: 'site',
        confirmationComplete: 'no',
        apikey: record['uniq'],
        stage: 1,
      }),
    );
  }

  async sendPush(token, client, employee_fio, service_name, date, start_time) {
    return await lastValueFrom(
      this.httpService.post('https://exp.host/--/api/v2/push/send', {
        to: token['pushtocken'],
        title: 'Новая запись',
        body: `${client.name} (${client.phone}) записался к ${employee_fio} на ${service_name} ${format(new Date(date), 'dd.MM.yyyy')} в ${start_time} через онлайн-запись`,
        sound: 'default',
      }),
    );
  }
}
