import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {HttpModule} from "@nestjs/axios";
import {DatabaseModule} from './core/database/database.module';
import {ConfigModule} from '@nestjs/config';
import { ApikeyModule } from './modules/apikey/apikey.module';
import {ApikeyService} from "./modules/apikey/apikey.service";
import {apikeyProviders} from "./modules/apikey/apikey.providers";

@Module({
    imports: [
        HttpModule,
        ConfigModule.forRoot({isGlobal: true}),
        DatabaseModule,
        ApikeyModule],
    controllers: [AppController],
    providers: [AppService, ApikeyService, ...apikeyProviders],
})
export class AppModule {
}
