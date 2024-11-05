import {
  Get,
  Controller,
  Render,
  Param,
  Post,
  Body,
  Query,
  Put,
  Res,
  Delete,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RecordService } from './modules/record/record.service';
import { RecordServiceDto } from './modules/record/dto/record.service.dto';
import { v4 as uuid } from 'uuid';
import { RecordDto } from './modules/record/dto/record.dto';
import { ConfigurationService } from './modules/configuration/configuration.service';
import { ConfigurationDto } from './modules/configuration/dto/configuration.dto';
import { Response } from 'express';
import { config } from '../config';
import { format } from 'date-fns';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private readonly configService: ConfigurationService,
    private readonly recordService: RecordService,
  ) {}

  @Post('/config')
  async config(@Body() config: ConfigurationDto) {
    try {
      return await this.configService.create(config);
    } catch (e) {
      return {
        error: e['original']['detail'],
      };
    }
  }

  @Get('/config')
  async getConfig(@Query('uniq') uniq: string) {
    const config = await this.configService.findOne(uniq);
    if (config === null) {
      return {
        error: 'Config not found',
      };
    }
    return config;
  }

  @Put('/config')
  async updateConfig(
    @Query('uniq') uniq: string,
    @Body() config: ConfigurationDto,
  ) {
    const res = await this.configService.update(uniq, config);
    if (res === null || res === undefined) {
      return {
        error: 'Config not found',
      };
    }
    return res;
  }

  @Delete('/config')
  async deleteConfig(@Query('uniq') uniq: string) {
    const res = await this.configService.delete(uniq);
    if (res === null || res === undefined) {
      return {
        error: 'Config not found',
      };
    }
    return res;
  }

  @Get('/')
  @Render('index')
  async root(@Query('uniq') uniq: string) {
    const user_id = uuid();
    const filial = await this.appService.getFilialInfo(uniq);
    const dto = new RecordDto(user_id, null, uniq, filial.name);
    await this.recordService.create(dto);
    const categories = await this.appService.getCategories(uniq);
    const services = await this.appService.getServices(uniq);
    services.forEach((service) => {
      if (!service.comment) {
        service.comment = 'Без комментариев';
      }
    });
    let address = '';
    filial.address.split(';').forEach((word) => {
      address += word + ', ';
    });
    address = address.slice(0, -2);
    if (
      filial.comment !== null &&
      filial.comment !== undefined &&
      filial.comment.trim() !== ''
    )
      address += `, ${filial.comment}`;
    const filial_cover_exist =
      filial.coverphoto !== null && filial.coverphoto !== '';
    const filial_logo_exist = filial.avatar !== null && filial.avatar !== '';
    return {
      categories: JSON.stringify(categories),
      services: JSON.stringify(services),
      filial_name: filial.name,
      filial_address: address,
      filial_cover: filial.coverphoto,
      filial_logo: filial.avatar,
      user_id: user_id,
      uniq: uniq,
      filial_cover_exist: filial_cover_exist,
      filial_logo_exist: filial_logo_exist,
    };
  }

  @Get('/booking/:id/:user_id')
  @Render('booking')
  async booking(@Param() params: any, @Res() res: Response) {
    const RESPONSE = {};
    let record = await this.recordService.findOne(params.user_id);
    const services = await this.appService.getServices(record['uniq']);
    const serv = services.find((service) => service.id === params.id);
    const rec = new RecordServiceDto(
      serv['id'],
      serv['duration'],
      serv['tarif'],
      serv['name'],
      serv['intervalonlinebooking'],
    );
    await this.recordService.update(params.user_id, rec);
    if (record['employee_id'] === null)
      await this.recordService.update(params.user_id, {employee_id: "any", employee_fio: "Любой сотрудник"})
    const employees = await this.appService.getEmployees(
      params.id,
      record['uniq'],
    );
    // await this.recordService.update(params.user_id, {employee_id: employees[0]['id'], employee_fio: 'Любой сотрудник'})
    if (employees.length === 1) {
      await this.recordService.update(params.user_id, {
        employee_fio: employees[0]['fio'],
        employee_id: employees[0]['id'],
      });
      RESPONSE['is_link_enabled'] = false;
    } else RESPONSE['is_link_enabled'] = true;
    if (record['date'] === '1970-01-01')
      await this.recordService.update(params.user_id, {
        date: new Date().toISOString().slice(0, 10),
      });
    record = await this.recordService.findOne(params.user_id);
    const employee = record['employee_id'];
    let dates = null;
    const week = await this.configService.getWeeks(record['uniq']);

    const response = {};
    const uniqDates = new Set();

    // Если сотрудник выбран
    if (
      employee !== null &&
      employee !== undefined &&
      employee !== '' &&
      employee !== 'any'
    ) {
      const data = await this.appService.getTimes1(
        employee,
        week,
        record['uniq'],
        serv,
        null,
      );
      response[employee] = data;

      try {
        for (const key in response) {
          response[key].forEach((item) => {
            uniqDates.add(item.date);
          });
        }
      } catch (e) {
        await this.recordService.delete(params.user_id);
        return res.redirect(`/?uniq=${record['uniq']}`);
      }

      dates = Array.from(uniqDates).sort(
        (a, b) =>
          new Date(a as string).getTime() - new Date(b as string).getTime(),
      );

      RESPONSE['employee_fio'] = await this.recordService.getEmployeeFio(
        params.user_id,
      );

      RESPONSE['chosen_date'] = dates[0];

      // const datata = await this.appService.getFirstFreeTime(employee, week, record['uniq'], serv, dates[0])
      // RESPONSE['chosen_time'] = datata[0]['times'][0]
      // const [hours, minutes] = datata[0]['times'][0].split(":").map(Number);
      // const newHours = (hours + Math.floor((minutes + parseInt(serv.duration)) / 60)) % 24;
      // const newMinutes = (minutes + parseInt(serv.duration)) % 60;
      // const time_end = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
      // await this.recordService.update(params.user_id, {date: dates[0], start_time: datata[0]['times'][0], end_time: time_end})

      // return {
      //     chosen_services: JSON.stringify(await this.recordService.getService(params.user_id)),
      //     days: JSON.stringify(dates),
      //     employee_fio: await this.recordService.getEmployeeFio(params.user_id),
      //     times: JSON.stringify(["10:00", "11:00", "12:00", "13:00"]),
      //     user_id: params.user_id
      // }
    }

    // Если сотрудник не выбран или выбран любой
    else {
      for (const employee of employees) {
        const data = await this.appService.getTimes1(
          employee['id'],
          week,
          record['uniq'],
          serv,
          null,
        );
        if (data === null) continue;
        response[employee['id']] = data;
      }

      for (const key in response) {
        response[key].forEach((item) => {
          uniqDates.add(item.date);
        });
      }

      dates = Array.from(uniqDates).sort(
        (a, b) =>
          new Date(a as string).getTime() - new Date(b as string).getTime(),
      );

      RESPONSE['employee_fio'] = 'Любой сотрудник';
      RESPONSE['chosen_date'] = dates[0];

      // let earliestDate: Date | null = null;
      // let earliestEmployeeId: string | null = null;

      // for (const employeeId in response) {
      //     for (const slot of response[employeeId]) {
      //         const currentDateTime = new Date(`${slot.date}T${slot.times[0]}`);
      //         if (!earliestDate || currentDateTime < earliestDate) {
      //             earliestDate = currentDateTime;
      //             earliestEmployeeId = employeeId;
      //         }
      //     }
      // }

      // earliestDate.setHours(earliestDate.getHours() + 3);

      // RESPONSE['chosen_time'] = earliestDate.toISOString().slice(11, 16);
    }

    if (record['date'] !== null) RESPONSE['chosen_date'] = record['date'];
    // else{
    //     RESPONSE['chosen_date'] = dates[0]
    // }
    if (record['start_time'] !== null)
      RESPONSE['chosen_time'] = record['start_time'];

    RESPONSE['chosen_services'] = JSON.stringify(
      await this.recordService.getService(params.user_id),
    );
    RESPONSE['days'] = JSON.stringify(dates);
    if (
      RESPONSE['chosen_date'] !== null &&
      RESPONSE['chosen_date'] !== undefined &&
      employee !== 'any' &&
      employee !== null
    ) {
      const temp = await this.appService.getTimes1(
        employee,
        0,
        record['uniq'],
        serv,
        RESPONSE['chosen_date'],
      );
      RESPONSE['times'] = JSON.stringify(temp[0]['times']);
    } else {
      const timeList: string[] = [];
      for (let hours = 0; hours < 24; hours++) {
        for (let minutes = 0; minutes < 60; minutes += 5) {
          const formattedHours = hours.toString().padStart(2, '0');
          const formattedMinutes = minutes.toString().padStart(2, '0');
          timeList.push(`${formattedHours}:${formattedMinutes}`);
        }
      }

      record['date'] = null;
      RESPONSE['times'] = JSON.stringify(timeList);
    }

    RESPONSE['duration'] = serv['duration'];
    RESPONSE['user_id'] = params.user_id;
    RESPONSE['url'] = config.url;
    RESPONSE['update'] = false;

    return RESPONSE;
  }

  @Post('/booking/choose_day')
  async booking_day(@Body() body: any) {
    //this.chosen_day = new Date(new Date(body.date).getFullYear(), new Date(body.date).getMonth(), new Date(body.date).getDate())
    await this.recordService.update(body.user_id, {
      date: body.date.split('T')[0],
      // start_time: null,
      // end_time: null,
    });
    const record = await this.recordService.findOne(body.user_id);
    const serv = await this.recordService.getService(body.user_id);
    const employees = await this.appService.getEmployees(
      serv[0]['id'],
      record['uniq'],
    );
    const response = {};
    const uniqTimes = new Set();
    for (const employee of employees) {
      const data = await this.appService.getTimes1(
        employee['id'],
        0,
        record['uniq'],
        serv[0],
        body.date.split('T')[0],
      );
      if (data === null) continue;
      response[employee['id']] = data[0];
    }
    for (const key in response) {
      response[key]['times'].forEach((item) => {
        uniqTimes.add(item);
      });
    }
    const times = Array.from(uniqTimes).sort((a, b) => {
      // Преобразование времени в минуты для сравнения
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      return timeToMinutes(a as string) - timeToMinutes(b as string);
    });

    return {
      message: 'Success',
      times: JSON.stringify(times),
    };
  }

  @Post('/booking/choose_time')
  async booking_time(@Body() body: any) {
    //this.chosen_time = body.time
    const [hours, minutes] = body.time.split(':').map(Number);
    const newHours =
      (hours + Math.floor((minutes + parseInt(body.duration)) / 60)) % 24;
    const newMinutes = (minutes + parseInt(body.duration)) % 60;
    const time_end = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    const record = await this.recordService.findOne(body.user_id);
    const serv = await this.recordService.getService(body.user_id);
    const employees = await this.appService.getEmployees(
      serv[0]['id'],
      record['uniq'],
    );
    // const response = {};
    // for (const employee of employees) {
    //   const data = await this.appService.getTimes1(
    //     employee['id'],
    //     0,
    //     record['uniq'],
    //     serv[0],
    //     record['date'],
    //   );
    //   if (data === null) continue;
    //   response[employee['id']] = data[0];
    // }

    // //const employee_times = response[record['employee_id']];

    // //if (record['employee_id'] === null) {
    // let chosen = null;
    // outerLoop: for (const key in response) {
    //   for (const item of response[key]['times']) {
    //     if (item === body.time) {
    //       chosen = employees.find((employee) => employee['id'] === key);
    //       break outerLoop;
    //     }
    //   }
    // }
    // await this.recordService.update(body.user_id, {
    //   start_time: body.time,
    //   end_time: time_end,
    //   employee_id: chosen['id'],
    //   employee_fio: chosen['fio'],
    // });
    // } else {
      await this.recordService.update(body.user_id, {
        start_time: body.time,
        end_time: time_end,
      });
    // }
  }

  @Get('/employee/:user_id')
  @Render('employee')
  async employee_page(@Param() params: any) {
    const record = await this.recordService.findOne(params.user_id);
    if (record['date'] !== null || record['start_time'] !== null) {
      const serv = await this.recordService.getService(params.user_id);
      const employees = await this.appService.getEmployees(
        serv[0]['id'],
        record['uniq'],
      );
      const new_employees = [];
      new_employees.push({
        id: 'any',
        fio: 'Любой сотрудник',
        position: null,
        avatar: null,
        status: 'Доступен',
      });
      const response = {};
      for (const employee of employees) {
        let data = await this.appService.getTimes1(
          employee['id'],
          0,
          record['uniq'],
          serv[0],
          record['date'],
        );
        if (data === null)
          data = await this.appService.getFirstFreeTime(
            employee['id'],
            await this.configService.getWeeks(record['uniq']),
            record['uniq'],
            serv[0],
            record['date'],
          );
        if (data === null) continue;
        new_employees.push({
          id: employee['id'],
          fio: employee['fio'],
          position: employee['position'],
          avatar: employee['avatar'],
        });
        response[employee['id']] = data[0];
      }
      let chosen = null;
      for (const key in response) {
        for (const item of response[key]['times']) {
          if (
            item === record['start_time'] &&
            response[key]['date'] === record['date']
          ) {
            chosen = new_employees.find((employee) => employee['id'] === key);
            chosen['status'] = 'Доступен';
            break;
          }
        }
        if (
          new_employees.find((employee) => employee['id'] === key)['status'] !==
          'Доступен'
        ) {
          //const firstDate = await this.appService.getFirstFreeTime(key, await this.configService.getWeeks(record['uniq']), record['uniq'], serv[0])
          new_employees.find((employee) => employee['id'] === key)['status'] =
            `Ближайшее доступное время ${format(new Date(response[key]['date']), 'dd.MM.yyyy')} в ${response[key]['times'][0]}`;
        }
      }
      return {
        employees: JSON.stringify(new_employees),
        service_id: record['service_id'],
        user_id: params.user_id,
        url: config.url,
      };
    } else {
      const serv = await this.recordService.getService(params.user_id);
      const employees = await this.appService.getEmployees(
        serv[0]['id'],
        record['uniq'],
      );
      const new_employees = [];
      for (const employee of employees) {
        new_employees.push({
          id: employee['id'],
          fio: employee['fio'],
          position: employee['position'],
          avatar: employee['avatar'],
          status: 'Доступен',
        });
      }
      return {
        employees: JSON.stringify(new_employees),
        service_id: record['service_id'],
        user_id: params.user_id,
        url: config.url,
      };
    }
  }

  @Post('/choose_employee')
  async choose_employee(@Body() body: any) {
    // TODO: использовать этот код в booking.hbs при выборе сотрудника со статусом "ближайшее время" для выделения ближайшего дня автоматически
    // const specificElement = document.querySelector('[data-date="2024-08-28T09:00:00.000Z"]');
    // document.querySelectorAll('.swiper-slide_date').forEach(el => el.classList.remove('active'));
    // specificElement.classList.add('active');
    const record = await this.recordService.findOne(body.user_id);
    const serv = await this.recordService.getService(body.user_id);
    const week = await this.configService.getWeeks(record['uniq']);
    await this.recordService.update(body.user_id, {
      employee_id: body.employee_id,
      employee_fio: body.employee_fio,
    });
    let data = null;
    if (body.employee_status !== 'Доступен')
      data = await this.appService.getFirstFreeTime(
        body.employee_id,
        week,
        record['uniq'],
        serv[0],
        record['date'],
      );
    else data = [{ date: record['date'], times: [record['start_time']] }];
    return {
      employee_id: body.employee_id,
      date: data[0]['date'],
      time: data[0]['times'][0],
      duration: parseInt(serv[0]['duration']),
    };
  }

  @Get('/summary/:user_id')
  @Render('summary')
  async summary(@Param() params: any, @Res() res: Response) {
    const record = await this.recordService.findOne(params.user_id);
    const service = await this.recordService.getService(params.user_id);
    const employees = await this.appService.getEmployees(
      service[0]['id'],
      record['uniq'],
    );
    if (!record['date'] || !record['start_time'])
      return res.redirect(`/booking/${record['service_id']}/${params.user_id}`);
    if (record['employee_id'] === 'any') {
      const response = {};
      for (const employee of employees) {
        const data = await this.appService.getTimes1(
          employee['id'],
          0,
          record['uniq'],
          service[0],
          record['date'],
        );
        if (data === null) continue;
        response[employee['id']] = data[0];
      }

      //const employee_times = response[record['employee_id']];

      //if (record['employee_id'] === null) {
      let chosen = null;
      outerLoop: for (const key in response) {
        for (const item of response[key]['times']) {
          if (item === record['start_time']) {
            chosen = employees.find((employee) => employee['id'] === key);
            break outerLoop;
          }
        }
      }
      await this.recordService.update(params.user_id, {
        employee_id: chosen['id'],
        employee_fio: chosen['fio'],
      });
    }
    const day = new Date(record['date']);
    
    const hours = Math.floor(parseInt(record['service_duration']) / 60);
    const minutes = parseInt(record['service_duration']) % 60;
    const hours_exists = hours > 0;
    return {
      chosen_services: JSON.stringify(service),
      employee_fio: record['employee_fio'],
      filial_name: record['filial_name'],
      day: day
        .toLocaleDateString('ru-RU', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        .slice(0, -3),
      time_start: record['start_time'],
      duration: record['service_duration'],
      hours_exists: hours_exists,
      duration_hours: hours,
      duration_minutes: minutes,
      time_end: record['end_time'],
      service_id: service[0]['id'],
      user_id: params.user_id,
      url: config.url,
      update: false,
    };
  }

  @Post('/summary/confirm')
  async summary_confirm(@Body() body: any, @Res() res: Response) {
    if (body.phone.length !== 11 || body.client_fio === '')
      return res.redirect(`/summary/${body.user_id}`);
    const record = await this.recordService.findOne(body.user_id);
    if (new Date() >= new Date(`${record['date']}T${record['start_time']}`))
      return res.redirect(`/?uniq=${record.uniq}`);
    let client: any = await this.appService.findClient(
      body.phone,
      record['uniq'],
    );
    if (client.phone === '') {
      await this.appService.addClient(
        body.phone,
        body.client_fio,
        record['uniq'],
      );
      client = await this.appService.findClient(body.phone, record['uniq']);
    }
    await this.appService.add_record(record, client);
    const employee = await this.appService.getCurrentUser(
      record['employee_id'],
      record['uniq'],
    );
    const tokens = employee[0]['pushtockens'];
    if (tokens !== null && tokens !== undefined) {
      if (tokens.length > 0) {
        tokens.forEach((token) => {
          this.appService.sendPush(
            token,
            client,
            record['employee_fio'],
            record['service_name'],
            record['date'],
            record['start_time'],
          );
        });
      }
    }
    return res.redirect(`/success/${body.user_id}`);
  }

  @Get('/success/:user_id')
  @Render('success')
  async success(@Param() params: any) {
    const record = await this.recordService.findOne(params.user_id);
    const day = new Date(record['date']);
    const filial = await this.appService.getFilialInfo(record['uniq']);
    const filial_logo_exist = filial.avatar !== null && filial.avatar !== '';
    const service = await this.recordService.getService(params.user_id);
    //await this.recordService.delete(params.user_id)
    return {
      chosen_services: JSON.stringify(service),
      employee_fio: record['employee_fio'],
      filial_name: record['filial_name'],
      day: day.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
      time_start: record['start_time'],
      filial_logo: filial.avatar,
      filial_logo_exist: filial_logo_exist,
      uniq: record['uniq'],
      url: config.url,
    };
  }

  @Post('/exit')
  async exit(@Body() body: any) {
    await this.recordService.delete(body.user_id);
    // return res.redirect(`/?uniq=${record['uniq']}`)
  }

  @Get('employee/back/:service_id/:user_id')
  async employee_back(@Param() params: any, @Res() res: Response) {
    await this.recordService.update(params.user_id, {
      employee_id: null,
      employee_fio: null,
    });
    return res.redirect(`/booking/${params.service_id}/${params.user_id}`);
  }

  @Get('booking/back/:service_id/:user_id')
  async booking_back(@Param() params: any, @Res() res: Response) {
    // await this.recordService.update(params.user_id, {
    //   employee_id: null,
    //   employee_fio: null,
    //   date: null,
    //   start_time: null,
    //   end_time: null,
    // });
    return res.redirect(`/booking/${params.service_id}/${params.user_id}`);
  }

  // @Get('/service')
  // @HttpCode(222)
  // @Render('service')
  // async service() {
  //   const categories = await this.appService.getCategories(
  //     'd7601151be99cf3f0844d5dfc1f09e1f',
  //   );
  //   const services = await this.appService.getServices(
  //     'd7601151be99cf3f0844d5dfc1f09e1f',
  //   );
  //   const filial = await this.appService.getFilialInfo(
  //     'd7601151be99cf3f0844d5dfc1f09e1f',
  //   );
  //   let address = '';
  //   let address_array = filial.address.split(';');
  //   address_array.forEach((word) => {
  //     address += word + ', ';
  //   });
  //   address = address.slice(0, -2);
  //   return {
  //     categories: JSON.stringify(categories),
  //     services: JSON.stringify(services),
  //     filial_name: filial.name,
  //     filial_address: address,
  //     filial_cover: filial.coverphoto,
  //     filial_logo: filial.avatar,
  //   };
  // }
}
