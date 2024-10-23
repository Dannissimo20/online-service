import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from './core/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { RecordModule } from './modules/record/record.module';
import { RecordService } from './modules/record/record.service';
import { recordProviders } from './modules/record/record.providers';
import { ConfigurationService } from './modules/configuration/configuration.service';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { configurationProviders } from './modules/configuration/configuration.providers';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RecordModule,
    ConfigModule,
    ConfigurationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RecordService,
    ConfigurationService,
    ...configurationProviders,
    ...recordProviders,
  ],
})
export class AppModule {}
