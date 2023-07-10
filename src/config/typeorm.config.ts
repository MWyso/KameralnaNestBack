import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Injectable } from '@nestjs/common';
import { configDb } from './config';
import { Admin } from '../admin/entity/admin.entity';

@Injectable()
export class DatabaseConfiguration implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'mysql',
      host: configDb.dbHost,
      username: configDb.dbUser,
      password: configDb.dbPassword,
      database: configDb.dbDatabase,
      entities: [Admin],
      autoLoadEntities: true,
      bigNumberStrings: false,
      logging: true,
      synchronize: true, // if true to create/update tables in db.
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}
