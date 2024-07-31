import {Get, Controller, Render, HttpCode, Param, Post, Body, Redirect} from '@nestjs/common';
import {AppService} from "./app.service";

@Controller()
export class AppController {
  constructor(private appService: AppService) {
  }

  private chosen_services :any[] = []
  private services :any[] = []
  private employees :any[] = []
  private chosen_employee :any
  private chosen_day :any
  private chosen_time :any

  @Get()
  @HttpCode(222)
  @Render('index')
  async root() {
    const categories = await this.appService.getCategories()
    this.services = await this.appService.getServices()
    this.services.forEach(service => {
      if (!service.comment){
        service.comment = "Без комментариев"
      }
    })
    const filial = await this.appService.getFilialInfo()
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
      filial_logo: filial.avatar
    };
  }

  @Get('choose_service/:id')
  @Redirect('/booking', 302)
  async choose_service(@Param() params: any) {
    this.chosen_services = []
    this.chosen_services.push(this.services.find(service => service.id === params.id))
    this.employees = await this.appService.getUsers(params.id)
    if (this.employees.length === 1) {
        this.chosen_employee = this.employees[0]
    }
  }

  @Get('/exit')
  @Redirect('/', 302)
  async exit() {
    this.chosen_services = []
  }

  @Get('/booking')
  @Render('booking')
  async booking() {
    if (this.chosen_employee){
      let dates = await this.appService.getDates(this.chosen_employee.id)
      return {
        chosen_services: JSON.stringify(this.chosen_services),
        days: JSON.stringify(dates),
        employee_fio: this.chosen_employee.fio,
        time_start: 12,
        time_end: 16,
        interval: 30
      }
    }
    else
      return {
        chosen_services: JSON.stringify(this.chosen_services),
        employee_fio: "Любой сотрудник",
      }
  }

  @Post('/booking/choose_day')
  async booking_day(@Body() body: any){
    this.chosen_day = new Date(new Date(body.date).getFullYear(), new Date(body.date).getMonth(), new Date(body.date).getDate())
    const times = await this.appService.getTimes(this.chosen_employee.id, body.date)
    return {
        message: "Success",
        time_start: parseInt(times.employee.work_start.slice(0, 2)),
        time_end: parseInt(times.employee.work_end.slice(0, 2)),
        interval: 30
      }
  }

  @Post('/booking/choose_time')
  async booking_time(@Body() body: any){
    this.chosen_time = body.time+":00"
  }


  @Get('/summary')
  @HttpCode(222)
  @Render('summary')
  async summary() {
    const categories = await this.appService.getCategories()
    const services = await this.appService.getServices()
    const filial = await this.appService.getFilialInfo()
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

  @Get('/employee')
  @Render('employee')
  employee_page(){
    return {employees: JSON.stringify(this.employees)}
  }

  @Get('/service')
  @HttpCode(222)
  @Render('service')
  async service() {
    const categories = await this.appService.getCategories()
    const services = await this.appService.getServices()
    const filial = await this.appService.getFilialInfo()
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

  @Post('spam')
  @Redirect('/', 301)
  async spam(@Body () body: any){
    let res = await this.appService.spam(body.spam);
    if (res == undefined) return {message: 'spam sent'};
    else return {message: 'spam not sent'}
  }

  @Get(':id')
  findOne(@Param() params: any){
    console.log(params.id);
    return {message:`This action returns a #${params.id} cat`, title: 'Cats'};
  }
}
