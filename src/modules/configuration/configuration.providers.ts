import { CONFIGURATION_REPOSITORY } from '../../core/constants';
import {Configuration} from "./configuration.entity";

export const configurationProviders = [{
    provide: CONFIGURATION_REPOSITORY,
    useValue: Configuration,
}];