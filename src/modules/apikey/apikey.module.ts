import { Module } from '@nestjs/common';
import { ApikeyService } from './apikey.service';
import {apikeyProviders} from "./apikey.providers";

@Module({
  providers: [ApikeyService, ...apikeyProviders],
})
export class ApikeyModule {}
