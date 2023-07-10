import { forwardRef, Module } from '@nestjs/common';
// import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseConfiguration } from './config/typeorm.config';
import { AdminModule } from './admin/admin.module';

// import { AtGuard } from './common/guards';
// import { CronService } from './cron/cron.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfiguration,
    }),
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 5,
    }),
    forwardRef(() => AdminModule),
    forwardRef(() => UsersModule),
  ],
  // providers: [{ provide: APP_GUARD, useClass: AtGuard }, CronService],
})
export class AppModule {}
