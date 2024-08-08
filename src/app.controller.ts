import {
  Get,
  Controller,
  Render,
  HttpCode,
  Param,
  Post,
  Body,
  Redirect,
  Query,
  Put,
  NotFoundException
} from '@nestjs/common';
import {AppService} from "./app.service";
import {ApikeyDto} from "./modules/apikey/dto/apikey.dto";
import {Apikeys} from "./modules/apikey/apikey.entity";
import {ApikeyService} from "./modules/apikey/apikey.service";
import {RecordService} from "./modules/record/record.service";
import {RecordServiceDto} from "./modules/record/dto/record.service.dto";
import {v4 as uuid} from 'uuid';
import {RecordDto} from "./modules/record/dto/record.dto";

@Controller()
export class AppController {
  constructor(private appService: AppService,
              private readonly apikeyService: ApikeyService,
              private readonly recordService: RecordService) {}

  private chosen_services :any[] = []
  private services :any[] = []
  private employees :any[] = []
  private chosen_employee :any
  private chosen_day :any
  private chosen_time :any

  @Post('/add_apikey')
  async add_apikey(@Body() body: ApikeyDto): Promise<Apikeys> {
    return await this.apikeyService.create(body)
  }

  @Post('/add/user')
  async add_user(@Body() body: any): Promise<any> {
      return await this.recordService.create(body)
  }

  @Get('/users')
  async get_users() {
    return await this.recordService.findAll()
  }

  @Get('/user/:id')
  async get_user(@Param() param) {
    return await this.recordService.findOne(param.id)
  }

  @Put('/user/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    const updatedPost = await this.recordService.update(id, body);

    return updatedPost;
  }

  @Get('/apikey/:id')
  async get_apikey(@Param() param) {
    return await this.apikeyService.findOne(param.id)
  }

  @Get('/')
  @Render('index')
  async root(@Query('uniq') uniq: number) {
    const user_id = uuid()
    const apikey = await this.apikeyService.findOne(uniq)
    const filial = await this.appService.getFilialInfo(apikey['apikey'])
    let dto = new RecordDto(user_id, apikey['apikey'], uniq, filial.name)
    await this.recordService.create(dto)
    const categories = await this.appService.getCategories(apikey['apikey'])
    this.services = await this.appService.getServices(apikey['apikey'])
    this.services.forEach(service => {
      if (!service.comment){
        service.comment = "Без комментариев"
      }
    })
    let address = ""
    filial.address.split(';').forEach(word => {
      address += word + ', '
    })
    address = address.slice(0, -2)
    return {
      categories: JSON.stringify(categories),
      services: JSON.stringify(this.services),
      filial_name: filial.name,
      filial_address: address,
      filial_cover: filial.coverphoto,
      filial_logo: filial.avatar,
      user_id: user_id,
      uniq: uniq
    };
  }

  @Get('/booking/:id/:user_id')
  @Render('booking')
  async booking(@Param() params: any) {
    this.chosen_services = []
    const serv = this.services.find(service => service.id === params.id)
    const employees = await this.appService.getUsers(params.id)
    const rec = new RecordServiceDto(serv['id'], serv['duration'], serv['tarif'], serv['name'])
    await this.recordService.update(params.user_id, rec)
    // TODO: поменять потом на выбор сотрудника
    await this.recordService.update(params.user_id, {employee_id: employees[0]['id'], employee_fio: employees[0]['fio']})

    let dates = await this.appService.getDates(await this.recordService.getEmployeeId(params.user_id))

    return {
      chosen_services: JSON.stringify(await this.recordService.getService(params.user_id)),
      days: JSON.stringify(dates),
      employee_fio: await this.recordService.getEmployeeFio(params.user_id),
      time_start: 12,
      time_end: 16,
      interval: 30,
      user_id: params.user_id
    }
  }

  @Post('/booking/choose_day')
  async booking_day(@Body() body: any){
    //this.chosen_day = new Date(new Date(body.date).getFullYear(), new Date(body.date).getMonth(), new Date(body.date).getDate())
    await this.recordService.update(body.user_id, {date: body.date.split('T')[0]})
    const times = await this.appService.getTimes(await this.recordService.getEmployeeId(body.user_id), body.date)
    return {
        message: "Success",
        time_start: parseInt(times.employee.work_start.slice(0, 2)),
        time_end: parseInt(times.employee.work_end.slice(0, 2)),
        interval: 30
    }
  }

  @Post('/booking/choose_time')
  async booking_time(@Body() body: any){
    //this.chosen_time = body.time
    const [hours, minutes] = body.time.split(":").map(Number);
    const newHours = (hours + Math.floor((minutes + parseInt(body.duration)) / 60)) % 24;
    const newMinutes = (minutes + parseInt(body.duration)) % 60;
    const time_end = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
    await this.recordService.update(body.user_id, {start_time: body.time, end_time: time_end})
  }

  @Get('/summary/:user_id')
  @Render('summary')
  async summary(@Param() params: any) {
    const record = await this.recordService.findOne(params.user_id)
    const day = new Date(record["date"])
    return {
      chosen_services: JSON.stringify(await this.recordService.getService(params.user_id)),
      employee_fio: record['employee_fio'],
      filial_name: record['filial_name'],
      day: day.toLocaleDateString("ru-RU", {weekday: "long", day: "numeric", month: "long", year: "numeric"}),
      time_start: record['start_time'],
      duration: record['service_duration'],
      time_end: record['end_time']
    };
  }

  // TODO: порешать с редиректом как нибудь
  @Post('/summary/confirm')
  async summary_confirm(@Body() body: any) {
    let client: any = await this.appService.findClient(body.phone)
    if (client.phone === ""){
      await this.appService.addClient(body.phone, body.client_fio)
      client = await this.appService.findClient(body.phone)
    }
    await this.appService.add_record(await this.recordService.findOne(body.user_id), client)
    await this.recordService.delete(body.user_id)
    return {
      message: "Success"
    }
  }

  @Get('/employee')
  @Render('employee')
  employee_page(){
    return {employees: JSON.stringify(this.employees)}
  }

  @Get('/service')
  @HttpCode(222)
  @Render('service')
  async service() {
    const categories = await this.appService.getCategories('d7601151be99cf3f0844d5dfc1f09e1f')
    const services = await this.appService.getServices('d7601151be99cf3f0844d5dfc1f09e1f')
    const filial = await this.appService.getFilialInfo('d7601151be99cf3f0844d5dfc1f09e1f')
    let address = ""
    let address_array = filial.address.split(';')
    address_array.forEach(word => {
      address += word + ', '
    })
    address = address.slice(0, -2)
    return {
      categories: JSON.stringify(categories),
      services: JSON.stringify(services),
      filial_name: filial.name,
      filial_address: address,
      filial_cover: filial.coverphoto,
      filial_logo: filial.avatar
    };
  }
}
