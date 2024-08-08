import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import {recordProviders} from "./record.providers";

@Module({
    providers: [RecordService, ...recordProviders]
})
export class RecordModule {}
