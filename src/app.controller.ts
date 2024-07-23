import {Get, Controller, Render, HttpCode, Param, Post, Body, Redirect} from '@nestjs/common';
import {AppService} from "./app.service";

@Controller()
export class AppController {
  constructor(private appService: AppService) {
  }

  @Get()
  @HttpCode(222)
  @Render('index')
  async root() {
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

  @Get('/booking')
  @Render('booking')
  booking() {
    return
  }

  @Get('/employee')
  @Render('employee')
  employee(){
    return
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
