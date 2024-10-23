import { Record } from './record.entity';
import { RECORD_REPOSITORY } from '../../core/constants';

export const recordProviders = [
  {
    provide: RECORD_REPOSITORY,
    useValue: Record,
  },
];
