import { Apikeys } from './apikey.entity';
import { APIKEY_REPOSITORY } from '../../core/constants';

export const apikeyProviders = [{
    provide: APIKEY_REPOSITORY,
    useValue: Apikeys,
}];