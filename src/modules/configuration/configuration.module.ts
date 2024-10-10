import { Module } from '@nestjs/common';
import {configurationProviders} from "./configuration.providers";
import {ConfigurationService} from "./configuration.service";

@Module({
    providers: [ConfigurationService, ...configurationProviders]
})
export class ConfigurationModule {}
