import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { SEQUELIZE, DEVELOPMENT, SQLITE } from '../constants';
import { databaseConfig } from './database.config';
import { Record } from '../../modules/record/record.entity';
import { Configuration } from '../../modules/configuration/configuration.entity';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case SQLITE:
          config = databaseConfig.sqlite;
          break;
        default:
          config = databaseConfig.development;
      }
      const sequelizeDevelopment = new Sequelize(
        databaseConfig.development as SequelizeOptions,
      );
      const sequelizeSQLite = new Sequelize(
        databaseConfig.sqlite as SequelizeOptions,
      );

      sequelizeDevelopment.addModels([Configuration]);
      sequelizeSQLite.addModels([Record]);

      await sequelizeDevelopment.sync();
      await sequelizeSQLite.sync();

      return {
        sequelizeDevelopment,
        sequelizeSQLite,
      };
    },
  },
];
