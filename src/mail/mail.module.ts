import { forwardRef, Module } from "@nestjs/common";
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from "@nestjs/config";
import { MailerConfiguration } from "../config/mailerconfig";
import { UsersModule } from "../users/users.module";
import { MailService } from "./mail.service";
import { MailController } from "./mail.controller";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MailerConfiguration,
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
